import OpenAI from 'openai';
import { env } from '../config/env';

type SmartCartContext = {
  user?: {
    id?: string;
  };
  semantic?: {
    primary_intent?: string;
    needs?: string[];
    goal?: string;
    summary?: string;
    stage?: string;
    risk?: string;
    intent_confidence?: number;
  };
  cart?: {
    items?: Array<{ name?: string; quantity?: number; category?: string; price?: number; slug?: string }>;
    totalItems?: number;
    totalValue?: number;
    categories?: string[];
  };
  session?: {
    behavior?: string;
    confidence?: number;
    numActions?: number;
    numAdds?: number;
    numRemoves?: number;
  };
  inventory?: {
    inStock?: number;
    outOfStock?: number;
  };
};

type LlmOptions = {
  userMessage: string;
  context: SmartCartContext | null;
  includeProducts: boolean;
  productHints?: Array<{ name: string; category?: string; price?: number; slug?: string; image?: string }>;
  recentMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

function getClient() {
  const apiKey = env.groqApiKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }
  const baseURL = env.groqBaseUrl || process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
  return new OpenAI({ apiKey, baseURL });
}

function buildContextBlock(ctx: SmartCartContext | null) {
  if (!ctx) return 'No signed-in user context available.';

  const semantic = ctx.semantic || {};
  const cart = ctx.cart || {};

  const cartItems = (cart.items || [])
    .slice(0, 12)
    .map(
      (it) =>
        `${it.name || 'item'} x${it.quantity ?? 1} (${it.category || 'category'}, $${Number(it.price || 0).toFixed(2)}, slug:${it.slug || 'n/a'})`
    )
    .join(', ');

  return [
    `user_id: ${ctx.user?.id || 'unknown'}`,
    `primary_intent: ${semantic.primary_intent || 'unknown'}`,
    `intent_confidence: ${semantic.intent_confidence ?? 'unknown'}`,
    `stage: ${semantic.stage || 'unknown'}`,
    `risk: ${semantic.risk || 'unknown'}`,
    `needs: ${(semantic.needs || []).join(', ') || 'none'}`,
    `cart_total_items: ${cart.totalItems ?? 'unknown'}`,
    `cart_total_value: ${cart.totalValue ?? 'unknown'}`,
    `cart_categories: ${(cart.categories || []).join(', ') || 'none'}`,
    `cart_items: ${cartItems || 'none'}`,
    `session_behavior: ${ctx.session?.behavior || 'unknown'}`,
    `session_confidence: ${ctx.session?.confidence ?? 'unknown'}`,
    `session_actions: ${ctx.session?.numActions ?? 'unknown'} (adds:${ctx.session?.numAdds ?? 'unknown'}, removes:${ctx.session?.numRemoves ?? 'unknown'})`,
    `inventory_summary: in_stock=${ctx.inventory?.inStock ?? 'unknown'}, out_of_stock=${ctx.inventory?.outOfStock ?? 'unknown'}`,
    semantic.goal ? `goal: ${semantic.goal}` : null,
    semantic.summary ? `summary: ${semantic.summary}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function generateAssistantReply(opts: LlmOptions): Promise<string> {
  const client = getClient();
  const model = env.groqModel || process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

  const contextBlock = buildContextBlock(opts.context);
  const productHints =
    opts.includeProducts && opts.productHints?.length
      ? `Candidate_products:\n${opts.productHints
          .slice(0, 6)
          .map(
            (p) =>
              `- name:${p.name}; category:${p.category || 'category'}; price:$${Number(p.price || 0).toFixed(2)}; slug:${p.slug || 'n/a'}; image:${p.image || 'n/a'}`
          )
          .join('\n')}`
      : '';
  const historyBlock = opts.recentMessages?.length
    ? `Recent_conversation:\n${opts.recentMessages
        .slice(-8)
        .map((m) => `- ${m.role}: ${m.content}`)
        .join('\n')}`
    : '';

  const system = [
    'You are SmartCart AI, a helpful shopping assistant inside a commerce app.',
    'You can answer general conversation naturally.',
    'Important rules:',
    '- If includeProducts=false: do NOT list or recommend specific products. Ask clarifying questions if needed.',
    '- If includeProducts=true: you MAY reference products, but keep the response concise and shopping-focused.',
    '- If includeProducts=true: ONLY reference products explicitly listed in Candidate_products. Never invent product names.',
    '- If the user asks for more products than provided in Candidate_products, acknowledge the limit and ask a follow-up.',
    '- If user asks about product details, use available card fields (name/category/price/slug) from Candidate_products.',
    '- Keep responses short: 2-5 sentences for general chat, 3-7 sentences for product guidance.',
    '- Never claim you already placed an order or added to cart unless explicitly told by system metadata/action status.',
    '- Use the provided context as grounding; do not invent user-specific details that are not in context.',
    '',
    'User_context:',
    contextBlock,
    '',
    historyBlock,
    '',
    productHints,
  ]
    .filter(Boolean)
    .join('\n');

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: opts.userMessage },
    ],
    temperature: 0.7,
  });

  return completion.choices?.[0]?.message?.content?.trim() || "I'm here—what would you like to do?";
}

