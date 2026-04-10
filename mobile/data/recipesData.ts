import { ProductItem } from './luxuryHomeData';

export type RecipeItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string;
  requiredProductIds: string[];
  ingredients: string[];
  instructions: string[];
};

export const mockRecipes: RecipeItem[] = [
  {
    id: 'recipe-1',
    title: 'Rustic Sourdough Braise',
    description: 'A slow-cooked, hearty weekend favorite that perfectly balances tender meat with charred, crusty bread.',
    time: '3 hours',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1544025162-811114cd6e7f?auto=format&fit=crop&w=1200&q=80',
    requiredProductIds: ['rec-1', 'prod-3'], // Dutch Oven, Prep Board
    ingredients: [
      '3 lbs boneless beef chuck roast, cut into chunks',
      '2 tbsp olive oil',
      '1 large onion, chopped',
      '4 carrots, thickly sliced',
      '2 cups beef broth',
      '1 cup dry red wine',
      '1 fresh thick-crust sourdough loaf'
    ],
    instructions: [
      'Preheat your oven to 325°F (160°C).',
      'Using your prep board, slice the onions and carrots into thick chunks.',
      'In your Dutch oven over medium-high heat, add olive oil and sear the beef until browned on all sides.',
      'Remove beef, add onions and carrots, and sauté until tender.',
      'Deglaze with red wine, scraping up the browned bits, then return the beef to the pot along with the broth.',
      'Cover and bake for 2.5 to 3 hours until perfectly tender. Serve alongside torn sourdough chunks.'
    ]
  },
  {
    id: 'recipe-2',
    title: 'Sunday Morning Espresso & Pastries',
    description: 'Elevate your weekend mornings with café-quality espresso paired with freshly baked, fruit-filled pastries.',
    time: '45 mins',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80',
    requiredProductIds: ['rec-3', 'prod-2', 'rec-4'], // Espresso Machine, Bake Set, Serving Tray
    ingredients: [
      'Freshly roasted espresso beans',
      '1 sheet puff pastry, thawed',
      '1 cup fresh berries',
      '1/4 cup cream cheese, softened',
      '2 tbsp powdered sugar'
    ],
    instructions: [
      'Preheat the oven to 400°F (200°C).',
      'Cut the puff pastry into squares. Spread a teaspoon of cream cheese in the center and top with berries.',
      'Bake in your stoneware nesting bake set for 15-20 minutes until golden brown and puffed.',
      'While pastries are cooling, pull a double shot using the Signature Espresso Machine.',
      'Dust pastries with powdered sugar and serve everything together on the walnut serving tray.'
    ]
  },
  {
    id: 'recipe-3',
    title: 'Seared Scallops with Herb Butter',
    description: 'Achieve restaurant-quality scallops at home. Quick, elegant, and phenomenally delicious.',
    time: '20 mins',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80',
    requiredProductIds: ['prod-1', 'rec-2', 'prod-4'], // Saute Pan, Dinner Plate, Flatware
    ingredients: [
      '1 lb jumbo dry sea scallops',
      'Salt and freshly ground black pepper',
      '2 tbsp olive oil',
      '3 tbsp unsalted butter',
      '2 cloves garlic, minced',
      '1 tbsp fresh parsley, chopped',
      'Lemon wedges for serving'
    ],
    instructions: [
      'Pat the scallops completely dry with a paper towel and season generously with salt and pepper.',
      'Heat the olive oil in the Tri-Ply Copper Core Saute Pan over high heat until it just begins to smoke.',
      'Place the scallops in the pan without crowding them. Sear undisturbed for exactly 2 minutes for a golden crust.',
      'Flip the scallops, then add the butter, garlic, and parsley to the pan. Baste the scallops for 1 more minute.',
      'Quickly transfer to the Hand-Glazed Dinner Plates, spooning the pan sauce over the top.',
      'Serve immediately with lemon wedges and your best flatware.'
    ]
  }
];
