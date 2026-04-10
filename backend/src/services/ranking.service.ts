import { SmartCartState, SemanticState } from '../types/state';
import { WEIGHTS } from '../config/rankingWeights';
import { cosineSimilarity } from '../utils/vector';

export interface RankedItem {
    productId: string;
    name: string;
    category: string;
    price: number;
    score: number;
    reasons: string[];
}

interface RankingContext {
    state: SmartCartState;
    semantic: SemanticState;
    related: { productId: string; score: number; type: string }[];
    selected?: { category: string }[];
}

// -------------------------------------------------------
// Score Components
// -------------------------------------------------------

function intentMatchScore(item: any, semantic: SemanticState): number {
    const intentNormalized = semantic.primary_intent.toLowerCase();
    const categoryNormalized = (item.category || '').toLowerCase();
    if (intentNormalized === categoryNormalized || semantic.intent.includes(categoryNormalized)) {
        return 1.0;
    }
    return 0.3;
}

function relationshipScore(itemId: string, relatedList: { productId: string; score: number }[]): number {
    const match = relatedList.find(r => r.productId === itemId);
    return match ? Math.min(match.score, 1.0) : 0;
}

function sessionScore(state: SmartCartState): number {
    if (state.session.behavior === 'fast') return 1.0;
    if (state.session.behavior === 'normal') return 0.7;
    return 0.4;
}

function inventoryScore(productId: string, inventory: Record<string, string>): number {
    if (!inventory[productId]) return 0.6;
    return inventory[productId] === 'IN_STOCK' ? 1.0 : 0;
}

function diversityPenalty(item: any, selectedItems: { category: string }[]): number {
    const sameCategory = selectedItems.filter(i => i.category === item.category);
    return sameCategory.length > 1 ? -0.2 : 0;
}

function biasScore(item: any): number {
    // Global popularity bias or promotional boost placeholder
    return item.isPromoted ? 1.0 : 0.5;
}

function computeScore(item: any, context: RankingContext): number {
    let intent = intentMatchScore(item, context.semantic);

    // 🔥 Added: Semantic Vector Match (The "ML" approach)
    if (item.embedding?.length > 0 && context.semantic.vector?.length > 0) {
        const similarity = cosineSimilarity(item.embedding, context.semantic.vector) || 0;
        intent = (intent + similarity) / 2; // Average category match and vector match
    }

    const rel = relationshipScore(item._id?.toString() || item.productId, context.related);
    const session = sessionScore(context.state);
    const inventory = inventoryScore(item._id?.toString() || item.productId, context.state.inventory);
    const diversity = diversityPenalty(item, context.selected || []);
    const bias = biasScore(item);

    return (
        WEIGHTS.intent * intent +
        WEIGHTS.relationship * rel +
        WEIGHTS.session * session +
        WEIGHTS.inventory * inventory +
        WEIGHTS.diversity * diversity +
        (WEIGHTS as any).bias * bias
    );
}

function buildReasons(item: any, context: RankingContext): string[] {
    const reasons: string[] = [];
    const productId = item._id?.toString() || item.productId;

    if (context.semantic.primary_intent.toLowerCase() === (item.category || '').toLowerCase()) {
        reasons.push('matches intent');
    }

    if (context.related.some(r => r.productId === productId)) {
        reasons.push('frequently bought together');
    }

    if (context.state.inventory[productId] === 'IN_STOCK') {
        reasons.push('in stock');
    }

    if (context.semantic.needs.some(need => (item.name || '').toLowerCase().includes(need.toLowerCase()))) {
        reasons.push('fills a gap in your cart');
    }

    return reasons;
}

// -------------------------------------------------------
// Ranking Engine — Main Entry
// -------------------------------------------------------

export function rankItems(candidates: any[], context: RankingContext): RankedItem[] {
    const results: RankedItem[] = [];

    for (const item of candidates) {
        const score = computeScore(item, context);

        if (score < 0.2) continue;

        results.push({
            productId: item._id?.toString() || item.productId,
            name: item.name,
            category: item.category,
            price: typeof item.price === 'number' ? item.price : (item.price?.selling || 0),
            score: parseFloat(score.toFixed(3)),
            reasons: buildReasons(item, context),
        });
    }

    return results.sort((a, b) => b.score - a.score);
}
