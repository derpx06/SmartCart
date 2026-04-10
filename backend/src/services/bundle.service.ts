import { CartIntelligencePanel, KitIntelligence, SemanticState, SmartBundle, SmartCartState } from '../types/state';

type RankedLike = {
  productId: string;
  slug?: string;
  image?: string;
  name: string;
  category: string;
  price: number;
  score?: number;
  reasons?: string[];
};

type CartLikeItem = SmartCartState['cart']['items'][number];
type Intent = 'bed_setup' | 'dining_setup' | 'kitchen_setup' | 'baking' | 'cooking' | 'general';

function normalize(v: string): string {
  return String(v || '').toLowerCase();
}

function titleCase(v: string): string {
  return v
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

function classifyItemIntent(item: CartLikeItem): string {
  const text = `${item.name} ${item.category}`.toLowerCase();
  if (/(bed|bedding|bedsheet|pillow|blanket|duvet|mattress)/.test(text)) return 'bed_setup';
  if (/(dining|dinner|table|chair|cutlery|placemat)/.test(text)) return 'dining_setup';
  if (/(kitchen|pan|pot|spatula|knife|cutting board|cook)/.test(text)) return 'kitchen_setup';
  if (/(bake|whisk|flour|sugar|muffin|tray|oven)/.test(text)) return 'baking';
  if (/(cook|ingredient|oil|spice|stove|prep)/.test(text)) return 'cooking';
  return 'general';
}

const COMPLEMENT_HINTS: Record<string, string[]> = {
  knife: ['cutting board', 'knife sharpener'],
  'dining table': ['chairs', 'placemat'],
  chair: ['dining table'],
  pan: ['spatula', 'oil'],
  pot: ['ladle'],
  bed: ['bedsheet', 'pillow'],
  mattress: ['bedsheet', 'pillow'],
};

function intentKeywords(intent: string): string[] {
  if (intent === 'bed_setup') return ['bed', 'bedding', 'sheet', 'pillow', 'blanket', 'duvet', 'mattress'];
  if (intent === 'dining_setup') return ['dining', 'table', 'chair', 'cutlery', 'placemat', 'dinner'];
  if (intent === 'kitchen_setup') return ['kitchen', 'pan', 'pot', 'spatula', 'knife', 'board', 'cook'];
  if (intent === 'baking') return ['bake', 'whisk', 'flour', 'sugar', 'tray', 'muffin', 'oven'];
  if (intent === 'cooking') return ['cook', 'ingredient', 'oil', 'spice', 'stove', 'prep'];
  return [];
}

function completionMessage(percent: number, intent: string): string {
  const label = titleCase(intent);
  if (percent < 40) return `${label} is in early stage. Add missing essentials first.`;
  if (percent <= 70) return `${label} is progressing. Add a few missing pieces to improve it.`;
  return `${label} is almost complete. Add the final essentials to finish.`;
}

function ctaFromPercent(percent: number): string {
  if (percent < 40) return 'Add essentials';
  if (percent <= 70) return 'Improve this setup';
  return 'Complete this setup';
}

function buildKitId(intent: string, index: number): string {
  return `${intent}_${index + 1}`;
}

function defaultNeeds(intent: Intent): string[] {
  if (intent === 'bed_setup') return ['bedsheet', 'pillow', 'blanket', 'pillow cover'];
  if (intent === 'dining_setup') return ['dining table', 'chairs', 'cutlery', 'placemat'];
  if (intent === 'kitchen_setup') return ['pan', 'oil', 'spatula', 'knife', 'cutting board'];
  if (intent === 'baking') return ['flour', 'sugar', 'whisk', 'bowl'];
  if (intent === 'cooking') return ['pan', 'oil', 'spatula', 'ingredients'];
  return ['essential item'];
}

function deriveDynamicNeeds(intent: Intent, items: CartLikeItem[], ranked: RankedLike[]): string[] {
  const bag = items.map((i) => `${normalize(i.name)} ${normalize(i.category)}`).join(' ');
  const dynamic = new Set<string>();

  // 1) infer direct complements from what user already has
  for (const item of items) {
    const text = normalize(item.name);
    for (const [key, vals] of Object.entries(COMPLEMENT_HINTS)) {
      if (text.includes(normalize(key))) {
        vals.forEach((v) => dynamic.add(v));
      }
    }
  }

  // 2) infer missing concepts from top AI-ranked candidates
  const keys = intentKeywords(intent);
  const rankedForIntent = ranked.filter((r) => {
    const txt = `${normalize(r.name)} ${normalize(r.category)}`;
    return keys.some((k) => txt.includes(normalize(k)));
  });
  for (const r of rankedForIntent.slice(0, 20)) {
    const txt = `${normalize(r.name)} ${normalize(r.category)}`;
    const mapped = defaultNeeds(intent).filter((need) => txt.includes(normalize(need)));
    mapped.forEach((m) => dynamic.add(m));
  }

  const combined = [...dynamic, ...defaultNeeds(intent)];
  return combined.filter((need) => !bag.includes(normalize(need)));
}

export function buildIntelligenceAndBundles(args: {
  state: SmartCartState;
  semantic: SemanticState;
  ranked: RankedLike[];
}): {
  intelligencePanel: CartIntelligencePanel;
  kitIntelligence: KitIntelligence[];
  smartBundles: SmartBundle[];
} {
  const { state, semantic, ranked } = args;
  const cartItems = state.cart.items || [];

  const intelligencePanel: CartIntelligencePanel = {
    intentLabel: titleCase(semantic.primary_intent || 'general'),
    goal: semantic.goal,
    completionPercent: semantic.completionPercent || 0,
    missingItems: semantic.missingItems || semantic.needs || [],
    riskLevel: semantic.risk,
    message: completionMessage(semantic.completionPercent || 0, semantic.primary_intent || 'general'),
  };

  if (cartItems.length < 3) {
    return { intelligencePanel, kitIntelligence: [], smartBundles: [] };
  }

  const kitsMap = new Map<string, CartLikeItem[]>();
  for (const item of cartItems) {
    const intent = classifyItemIntent(item);
    const list = kitsMap.get(intent) || [];
    list.push(item);
    kitsMap.set(intent, list);
  }

  const kitEntries = [...kitsMap.entries()].filter(([intent]) => intent !== 'general');
  const sourceEntries: Array<[string, CartLikeItem[]]> = kitEntries.length
    ? (kitEntries as Array<[string, CartLikeItem[]]>)
    : [[semantic.primary_intent || 'general', cartItems]];

  const kitIntelligence: KitIntelligence[] = [];
  const smartBundles: SmartBundle[] = [];
  const usedRecommendationIds = new Set<string>();

  sourceEntries.forEach(([intent, items], idx) => {
    const kitId = buildKitId(intent, idx);
    const required = (semantic.primary_intent === intent ? semantic.requiredItems : undefined) || [];
    const defaults = required.length > 0 ? required : defaultNeeds(intent as Intent);
    const inferredMissing = deriveDynamicNeeds(intent as Intent, items, ranked);
    const dynamicNeeds = [...new Set([...inferredMissing, ...defaults])];

    const bag = items.map((i) => `${normalize(i.name)} ${normalize(i.category)}`).join(' ');
    const present = dynamicNeeds.filter((k) => bag.includes(normalize(k)));
    const missing = dynamicNeeds.filter((k) => !present.includes(k));
    const completionPercent = dynamicNeeds.length ? Math.round((present.length / dynamicNeeds.length) * 100) : 0;

    const kitRisk: 'low' | 'medium' | 'high' =
      completionPercent < 35 || state.session.confidence < 0.4
        ? 'high'
        : completionPercent < 70 || state.session.confidence < 0.7
          ? 'medium'
          : 'low';

    const keys = intentKeywords(intent);
    const picked = ranked.filter((r) => {
      if (usedRecommendationIds.has(r.productId)) return false;
      const txt = `${normalize(r.name)} ${normalize(r.category)}`;
      const byMissing = missing.some((m) => txt.includes(normalize(m)));
      const byIntent = keys.some((k) => txt.includes(normalize(k)));
      return byMissing || byIntent;
    });
    const fallback = ranked.filter((r) => !usedRecommendationIds.has(r.productId));
    const recommendations = (picked.length ? picked : fallback).slice(0, kitRisk === 'high' ? 2 : 4);
    recommendations.forEach((r) => usedRecommendationIds.add(r.productId));

    kitIntelligence.push({
      kitId,
      intentLabel: titleCase(intent),
      completionPercent,
      missingItems: missing,
      riskLevel: kitRisk,
      message: completionMessage(completionPercent, intent),
    });

    smartBundles.push({
      kitId,
      title: `${titleCase(intent).replace(' Setup', '')} Kit`,
      subtitle: `Complete your ${titleCase(intent).toLowerCase().replace(' setup', '')} setup`,
      intentLabel: titleCase(intent),
      completionPercent,
      have: items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        category: i.category,
        price: i.price,
        quantity: i.quantity,
      })),
      missing: missing.map((keyword) => ({
        keyword,
        recommendation: recommendations.find((r) =>
          `${normalize(r.name)} ${normalize(r.category)}`.includes(normalize(keyword))
        ),
      })),
      recommendations,
      cta: ctaFromPercent(completionPercent),
    });
  });

  return { intelligencePanel, kitIntelligence, smartBundles };
}

