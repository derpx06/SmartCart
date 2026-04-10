export type RecipeItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  servings: string;
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
    servings: 'Serves 6',
    difficulty: 'Medium',
    image: 'https://www.kingarthurbaking.com/sites/default/files/2021-07/Rustic-Sourdough-Loaf_0049__0.jpg',
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
      'Preheat your oven to 325F (160C).',
      'Using your prep board, slice the onions and carrots into thick chunks.',
      'In your Dutch oven over medium-high heat, add olive oil and sear the beef until browned on all sides.',
      'Remove beef, add onions and carrots, and saute until tender.',
      'Deglaze with red wine, scraping up the browned bits, then return the beef to the pot along with the broth.',
      'Cover and bake for 2.5 to 3 hours until perfectly tender. Serve alongside torn sourdough chunks.'
    ]
  },
  {
    id: 'recipe-2',
    title: 'Sunday Morning Espresso & Pastries',
    description: 'Elevate your weekend mornings with cafe-quality espresso paired with freshly baked, fruit-filled pastries.',
    time: '45 mins',
    servings: 'Serves 4',
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
      'Preheat the oven to 400F (200C).',
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
    servings: 'Serves 2',
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
  },
  {
    id: 'recipe-4',
    title: 'Citrus Herb Roast Chicken',
    description: 'Crisp skin, juicy meat, and bright citrus aromatics make this a timeless centerpiece dinner.',
    time: '1 hr 25 mins',
    servings: 'Serves 5',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80',
    requiredProductIds: ['rec-1', 'prod-3', 'rec-2'], // Dutch Oven, Prep Board, Dinner Plates
    ingredients: [
      '1 whole chicken (about 4 lbs)',
      '2 tbsp softened butter',
      '1 lemon, halved',
      '1 orange, sliced',
      '4 garlic cloves, smashed',
      '2 tbsp chopped rosemary and thyme',
      'Salt and freshly ground black pepper'
    ],
    instructions: [
      'Preheat oven to 425F (220C) and pat the chicken dry.',
      'Rub butter, herbs, salt, and pepper all over the chicken and under the skin where possible.',
      'Stuff the cavity with lemon halves and garlic, then arrange orange slices under and around the bird.',
      'Roast in a Dutch oven uncovered for 65 to 75 minutes, basting once midway, until juices run clear.',
      'Rest for 10 minutes before carving and serving on warmed dinner plates.'
    ]
  },
  {
    id: 'recipe-5',
    title: 'Truffle Mushroom Risotto',
    description: 'Silky Arborio rice folded with sauteed mushrooms and truffle butter for a rich date-night bowl.',
    time: '55 mins',
    servings: 'Serves 4',
    difficulty: 'Hard',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80',
    requiredProductIds: ['prod-1', 'prod-3', 'prod-4'], // Saute Pan, Prep Board, Flatware
    ingredients: [
      '1 1/2 cups Arborio rice',
      '5 cups warm vegetable stock',
      '2 tbsp olive oil',
      '10 oz mixed mushrooms, sliced',
      '1 small shallot, finely chopped',
      '1/2 cup dry white wine',
      '3 tbsp truffle butter',
      '1/2 cup grated Parmesan'
    ],
    instructions: [
      'Saute mushrooms in olive oil until golden, season lightly, and set aside.',
      'In the same pan, cook shallot until translucent, then toast the Arborio rice for 1 minute.',
      'Pour in white wine and stir until absorbed.',
      'Add warm stock one ladle at a time, stirring continuously and waiting for each addition to absorb.',
      'When rice is creamy and al dente, fold in mushrooms, truffle butter, and Parmesan, then serve immediately.'
    ]
  },
  {
    id: 'recipe-6',
    title: 'Caramelized Peach Galette',
    description: 'A free-form tart with flaky pastry, ripe peaches, and a glossy caramel finish.',
    time: '1 hr 10 mins',
    servings: 'Serves 6',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=1200&q=80',
    requiredProductIds: ['prod-2', 'rec-4', 'rec-3'], // Bake Set, Serving Tray, Espresso Machine
    ingredients: [
      '1 refrigerated pie crust',
      '4 ripe peaches, sliced',
      '2 tbsp brown sugar',
      '1 tbsp cornstarch',
      '1/2 tsp cinnamon',
      '1 tbsp melted butter',
      '1 egg, beaten'
    ],
    instructions: [
      'Preheat oven to 400F (200C) and line your baking dish with parchment.',
      'Toss peaches with brown sugar, cornstarch, and cinnamon.',
      'Roll out pie crust, mound peaches in the center, and fold edges inward to form a rustic ring.',
      'Brush crust with egg wash and drizzle peaches with melted butter.',
      'Bake 35 to 40 minutes until deeply golden, then cool slightly and serve on a walnut tray.'
    ]
  }
];
