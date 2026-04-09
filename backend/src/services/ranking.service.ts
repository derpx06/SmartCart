import { SmartCartState, SemanticState } from '../types/state';
import { WEIGHTS } from '../config/rankingWeights';

export interface RankedItem {
    productId: string;
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
    return inventory[productId] === 'IN_STOCK' ? 1.0 : 0;
}

function diversityPenalty(item: any, selectedItems: { category: string }[]): number {
    const sameCategory = selectedItems.filter(i => i.category === item.category);
    return sameCategory.length > 1 ? -0.2 : 0;
}

function computeScore(item: any, context: RankingContext): number {
    const intent = intentMatchScore(item, context.semantic);
    const rel = relationshipScore(item._id?.toString() || item.productId, context.related);
    const session = sessionScore(context.state);
    const inventory = inventoryScore(item._id?.toString() || item.productId, context.state.inventory);
    const diversity = diversityPenalty(item, context.selected || []);

    return (
        WEIGHTS.intent * intent +
        WEIGHTS.relationship * rel +
        WEIGHTS.session * session +
        WEIGHTS.inventory * inventory +
        WEIGHTS.diversity * diversity
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
            score: parseFloat(score.toFixed(3)),
            reasons: buildReasons(item, context),
        });
    }

    return results.sort((a, b) => b.score - a.score);
}
