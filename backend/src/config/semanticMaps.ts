export const NEEDS_MAP: Record<string, string[]> = {
    cooking: ['oil', 'spatula', 'ingredients', 'pan', 'knife'],
    kitchen_setup: ['pan', 'oil', 'spatula', 'knife', 'cutting board'],
    baking: ['flour', 'sugar', 'whisk', 'muffin tin', 'bowl'],
    bed_setup: ['bedsheet', 'pillow', 'blanket', 'pillow cover', 'mattress protector'],
    home_setup: ['decor', 'lighting', 'storage', 'shelf'],
    gifting: ['card', 'gift_wrap', 'ribbon', 'bag'],
};

export const GOAL_MAP: Record<string, string> = {
    cooking: 'prepare a professional meal',
    kitchen_setup: 'complete your kitchen setup',
    baking: 'bake delicious treats',
    bed_setup: 'complete your bedroom setup',
    home_setup: 'organize and decorate living space',
    gifting: 'prepare a thoughtful gift',
    general: 'browse catalog',
};
