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
    baking: [
        'baking tools and mixers',
        'bakeware and dessert prep',
        'cookies cakes pastries'
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

    // 4. Compute missing needs
    const expectedNeeds = NEEDS_MAP[bestIntent] || [];
    const cartNamesLower = state.cart.items.map(i => i.name.toLowerCase());
    const cartCategoriesLower = state.cart.items.map(i => i.category.toLowerCase());

    const needs = expectedNeeds.filter(
        need => !cartNamesLower.some(name => name.includes(need.toLowerCase())) &&
            !cartCategoriesLower.some(cat => cat.includes(need.toLowerCase()))
    );

    // 5. Stage detection
    let stage: 'exploring' | 'deciding' | 'ready' = 'exploring';
    const confidence = state.session.confidence;

    if (confidence >= 0.75) stage = 'ready';
    else if (confidence >= 0.45) stage = 'deciding';

    // 6. Risk detection
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (confidence < 0.4) risk = 'high';
    else if (confidence < 0.7) risk = 'medium';

    // 7. Goal + summary
    const goal = GOAL_MAP[bestIntent] || 'browse products';

    return {
        intent: [bestIntent],
        primary_intent: bestIntent,
        goal,
        summary: `Based on your cart, you seem to be focusing on ${bestIntent.replace('_', ' ')}.`,
        intent_confidence: parseFloat(bestScore.toFixed(2)),
        stage,
        needs,
        risk,
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
        vector: [],
    };
}
