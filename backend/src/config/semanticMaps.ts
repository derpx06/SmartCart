export const NEEDS_MAP: Record<string, string[]> = {
    cooking: ['oil', 'spatula', 'ingredients', 'pan', 'knife', 'cutting board', 'spice', 'garlic'],
    kitchen_setup: ['pan', 'oil', 'spatula', 'knife', 'cutting board', 'pot', 'cookware'],
    dining_setup: ['dining table', 'chairs', 'cutlery', 'placemat', 'plate', 'bowl', 'glass'],
    baking: ['flour', 'sugar', 'whisk', 'muffin tin', 'bowl', 'tray', 'oven'],
    bed_setup: ['bedsheet', 'pillow', 'blanket', 'pillow cover', 'mattress protector', 'duvet'],
    home_setup: ['decor', 'lighting', 'storage', 'shelf', 'lamp', 'furniture'],
    gifting: ['card', 'gift wrap', 'ribbon', 'bag', 'gift'],
};

export const GOAL_MAP: Record<string, string> = {
    cooking: 'prepare a professional meal',
    kitchen_setup: 'complete your kitchen setup',
    dining_setup: 'complete your dining setup',
    baking: 'bake delicious treats',
    bed_setup: 'complete your bedroom setup',
    home_setup: 'organize and decorate living space',
    gifting: 'prepare a thoughtful gift',
    general: 'browse catalog',
};
