import { SemanticState, SmartCartState } from '../types/state';
import { NEEDS_MAP, GOAL_MAP } from '../config/semanticMaps';
import { cosineSimilarity, averageEmbedding } from '../utils/vector';
import { embedText } from './embedding.service';

const INTENT_SEEDS: Record<string, string[]> = {
    cooking: [
        'cookware and kitchen essentials',
        'pots pans and prep tools',
        'cook at home'
    ],
    kitchen_setup: [
        'kitchen setup essentials',
        'kitchen tools and pantry basics',
        'daily cooking essentials'
    ],
    dining_setup: [
        'dining table and chairs setup',
        'table setting and dining essentials',
        'dining room setup'
    ],
    baking: [
        'baking tools and mixers',
        'bakeware and dessert prep',
        'cookies cakes pastries'
    ],
    bed_setup: [
        'bedroom setup bedding and sleep comfort',
        'bedsheets pillows blankets bedroom essentials',
        'bed kit and sleep accessories'
    ],
    home_setup: [
        'home setup and decor',
        'furniture lighting and organization',
        'home improvement essentials'
    ],
    gifting: [
        'gift ideas and registry',
        'holiday presents and premium gifts',
        'wedding registry items'
    ],
};

let intentVectorCache: Record<string, number[]> | null = null;

function normalize(s: string): string {
    return String(s || '').toLowerCase();
}

function messageForCompletion(percent: number, intent: string): string {
    const label = intent.replace(/_/g, ' ');
    if (percent < 40) return `Your ${label} setup is still early. Add essentials first.`;
    if (percent <= 70) return `You are making progress on ${label}. Add a couple of key items to strengthen it.`;
    return `Your ${label} setup is almost complete. Finish with the final essentials.`;
}

function detectIntentFromCartText(state: SmartCartState): string | null {
    const text = state.cart.items
        .map(i => `${i.name} ${i.category}`)
        .join(' ')
        .toLowerCase();
    const checks: Array<{ intent: string; keys: string[] }> = [
        { intent: 'bed_setup', keys: ['bed', 'bedding', 'bedsheet', 'pillow', 'blanket', 'mattress', 'duvet'] },
        { intent: 'kitchen_setup', keys: ['kitchen', 'pan', 'pot', 'cook', 'spatula', 'knife', 'board'] },
        { intent: 'dining_setup', keys: ['dining', 'table', 'chair', 'cutlery', 'placemat'] },
        { intent: 'baking', keys: ['bake', 'whisk', 'oven', 'flour', 'sugar', 'tray', 'muffin'] },
        { intent: 'cooking', keys: ['cook', 'ingredient', 'oil', 'spice', 'stove', 'prep'] },
        { intent: 'home_setup', keys: ['decor', 'storage', 'shelf', 'lighting', 'furniture'] },
    ];
    let best: { intent: string; score: number } | null = null;
    for (const c of checks) {
        const score = c.keys.reduce((acc, k) => (text.includes(k) ? acc + 1 : acc), 0);
        if (score > 0 && (!best || score > best.score)) best = { intent: c.intent, score };
    }
    return best?.intent || null;
}

async function getIntentVectors() {
    if (intentVectorCache) return intentVectorCache;

    const entries = Object.entries(INTENT_SEEDS);
    const result: Record<string, number[]> = {};

    for (const [intent, seeds] of entries) {
        const vectors: number[][] = [];
        for (const seed of seeds) {
            const vector = await embedText(seed);
            if (vector.length) vectors.push(vector);
        }
        result[intent] = averageEmbedding(vectors);
    }

    intentVectorCache = result;
    return result;
}

export async function getSemanticState(state: SmartCartState): Promise<SemanticState> {
    // 1. Extract product embeddings
    const embeddings = state.cart.items
        .map(i => i.embedding)
        .filter((e): e is number[] => !!e && e.length > 0);

    if (embeddings.length === 0) {
        return fallbackState();
    }

    // 2. Build cart embedding
    const cartEmbedding = averageEmbedding(embeddings);

    // 3. Detect intent via similarity
    const intentVectors = await getIntentVectors();
    let bestIntent = 'general';
    let bestScore = -1;

    for (const intent in intentVectors) {
        const score = cosineSimilarity(cartEmbedding, intentVectors[intent]);

        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }

    // If score is too low, stay with general
    if (bestScore < 0.3) {
        bestIntent = 'general';
    }

    // Keyword/category heuristic override for stronger cart-context matches.
    const heuristicIntent = detectIntentFromCartText(state);
    if (heuristicIntent) {
        bestIntent = heuristicIntent;
        bestScore = Math.max(bestScore, 0.65);
    }

    // 4. Compute missing needs with logic that checks for synonyms/broad categories
    const expectedNeeds = NEEDS_MAP[bestIntent] || [];
    const cartText = state.cart.items
        .map(i => `${normalize(i.name)} ${normalize(i.category)}`)
        .join(' | ');

    const presentItems = expectedNeeds.filter((need) => {
        const normalizedNeed = normalize(need);
        // Fuzzy match: if the need keyword is contained anywhere in the cart's combined text
        return cartText.includes(normalizedNeed);
    });

    const needs = expectedNeeds.filter(need => !presentItems.includes(need));

    const completionPercent = expectedNeeds.length
        ? Math.max(0, Math.min(100, Math.round((presentItems.length / expectedNeeds.length) * 100)))
        : 0;

    // 5. Stage detection
    let stage: 'exploring' | 'deciding' | 'ready' = 'exploring';
    const confidence = state.session.confidence;

    if (confidence >= 0.75) stage = 'ready';
    else if (confidence >= 0.45) stage = 'deciding';

    // 6. Risk detection
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (confidence < 0.4 || completionPercent < 35) risk = 'high';
    else if (confidence < 0.7 || completionPercent < 70) risk = 'medium';

    // 7. Goal + summary
    const goal = GOAL_MAP[bestIntent] || 'browse products';

    return {
        intent: [bestIntent],
        primary_intent: bestIntent,
        goal,
        summary: messageForCompletion(completionPercent, bestIntent),
        intent_confidence: parseFloat(bestScore.toFixed(2)),
        stage,
        needs,
        risk,
        completionPercent,
        requiredItems: expectedNeeds,
        presentItems,
        missingItems: needs,
        vector: cartEmbedding,
    };
}

function fallbackState(): SemanticState {
    return {
        intent: ['general'],
        primary_intent: 'general',
        goal: 'exploring catalog',
        summary: 'Start adding items to your cart for personalized insights.',
        intent_confidence: 0,
        stage: 'exploring',
        needs: [],
        risk: 'low',
        completionPercent: 0,
        requiredItems: [],
        presentItems: [],
        missingItems: [],
        vector: [],
    };
}
