import mongoose from 'mongoose';
import { env } from '../config/env';
import Product from '../models/Product';
import { embedProduct } from '../services/productEmbedding.service';

const products = [
  // Kitchen Tools - Knives (Choices)
  {
    name: 'Chef\'s Choice 8" Stainless Steel Knife',
    slug: 'chefs-choice-8-stainless-knife',
    description: 'A versatile, perfectly balanced 8-inch chef\'s knife with a high-carbon stainless steel blade. Ideal for precise chopping and slicing.',
    brand: 'CulinaryPro',
    category: 'kitchen tools',
    subCategory: 'Knives',
    price: { selling: 49.99, original: 65.00 },
    attributes: { material: 'Stainless Steel', color: 'Silver/Black' },
    images: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585237303023-e18d6a8e8f85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614278453715-188b8ccfde90?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 45 }
  },
  {
    name: 'Santoku 7" Japanese Style Knife',
    slug: 'santoku-7-japanese-knife',
    description: 'A lightweight 7-inch Santoku knife, perfect for paper-thin precision slicing of vegetables and meats with its Granton edge.',
    brand: 'KyotoBlades',
    category: 'kitchen tools',
    subCategory: 'Knives',
    price: { selling: 75.00, original: 90.00 },
    attributes: { material: 'VG-10 Steel', color: 'Damascus Steel' },
    images: [
      'https://images.unsplash.com/photo-1576426463991-3252c1feebac?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1627581903964-672ce34f2a5b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624462966581-bc567d58f557?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 30 }
  },
  {
    name: 'Utility 5" Paring Knife',
    slug: 'utility-5-paring-knife',
    description: 'Small but mighty 5-inch paring knife designed for peeling, trimming, and intricate cuts. Hand-sharpened to a 15-degree edge.',
    brand: 'CulinaryPro',
    category: 'kitchen tools',
    subCategory: 'Knives',
    price: { selling: 24.99, original: 30.00 },
    attributes: { material: 'Carbon Steel', color: 'Black Walnut' },
    images: [
      'https://images.unsplash.com/photo-1631558556885-21d120a2731c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596767746142-bba71b8ee2ec?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546875887-f131102b4d24?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 120 }
  },
  {
    name: 'Serrated 10" Bread Knife',
    slug: 'serrated-10-bread-knife',
    description: 'A perfectly offset 10-inch serrated edge slices right through crusty artisanal bread without crushing the soft interior.',
    brand: 'BakeWell',
    category: 'kitchen tools',
    subCategory: 'Knives',
    price: { selling: 35.00 },
    attributes: { material: 'Stainless Steel', color: 'Ivory White' },
    images: [
      'https://images.unsplash.com/photo-1588190565860-fe6ae59a0b9a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579219357053-1574a4cf962e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1520981825232-ece5faeecdb5?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 50 }
  },
  {
    name: 'Heavy Duty 7" Meat Cleaver',
    slug: 'heavy-duty-7-meat-cleaver',
    description: 'A heavy-weighted carbon steel meat cleaver explicitly built for tackling thick cuts and bone-in chops.',
    brand: 'KyotoBlades',
    category: 'kitchen tools',
    subCategory: 'Knives',
    price: { selling: 85.00 },
    attributes: { material: 'High Carbon Steel', color: 'Dark Steel' },
    images: [
      'https://images.unsplash.com/photo-1563212036-7c91ca73c4f7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584907600868-b32ffc958617?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583337260546-28b61e2cc6c5?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 15 }
  },

  // Kitchen Tools
  {
    name: 'End Grain Teak Cutting Board',
    slug: 'end-grain-teak-cutting-board',
    description: 'A self-healing, incredibly durable end-grain teak wood cutting board. Will protect your expensive chef knives.',
    brand: 'ForestEdge',
    category: 'kitchen tools',
    subCategory: 'Boards',
    price: { selling: 65.00 },
    attributes: { material: 'Teak Wood', color: 'Dark Wood' },
    images: [
      'https://images.unsplash.com/photo-1602758162817-26d9e03d92fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594922119106-93d3957ce32b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582285141103-625d97f53488?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 40 }
  },
  {
    name: 'Silicone Spatula Set (3 Piece)',
    slug: 'silicone-spatula-set-3pc',
    description: 'Heat-resistant up to 600°F seamless silicone spatulas. Will not harbor bacteria or scratch non-stick surfaces.',
    brand: 'EcoCook',
    category: 'kitchen tools',
    subCategory: 'Utensils',
    price: { selling: 15.99 },
    attributes: { material: 'Silicone', color: 'Midnight Blue' },
    images: [
      'https://images.unsplash.com/photo-1584984244243-7ec97e4cabd1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579306194872-64d3b7bcacaa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 180 }
  },
  {
    name: 'Digital Meat Thermometer',
    slug: 'digital-meat-thermometer',
    description: 'Instant-read thermometer giving readings in under 3 seconds. Ensure perfect medium-rare steaks every time.',
    brand: 'CulinaryPro',
    category: 'kitchen tools',
    subCategory: 'Gadgets',
    price: { selling: 29.99 },
    attributes: { material: 'Plastic / Steel', color: 'Red/Black' },
    images: [
      'https://images.unsplash.com/photo-1618685149306-25f05b9b1836?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555541604-c3c1e21b0bc4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584589167171-54764e04111f?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 80 }
  },

  // Cookware
  {
    name: 'Cast Iron Skillet 12"',
    slug: 'cast-iron-skillet-12',
    description: 'A heavy-duty pre-seasoned 12-inch cast iron skillet. Retains heat perfectly for searing steaks or baking cornbread.',
    brand: 'LodgeMaster',
    category: 'cookware',
    subCategory: 'Pans',
    price: { selling: 39.99, original: 45.00 },
    attributes: { material: 'Cast Iron', color: 'Black' },
    images: [
      'https://images.unsplash.com/photo-1584907600868-b32ffc958617?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546875887-f131102b4d24?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583337260546-28b61e2cc6c5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 60 }
  },
  {
    name: 'Ceramic Frying Pan Set (8" & 10")',
    slug: 'ceramic-frying-pan-set',
    description: 'Set of two non-toxic ceramic coated frying pans. Eggs slide right off with zero effort.',
    brand: 'EcoCook',
    category: 'cookware',
    subCategory: 'Pans',
    price: { selling: 89.99, original: 110.00 },
    attributes: { material: 'Ceramic / Aluminum', color: 'Sage Green' },
    images: [
      'https://images.unsplash.com/photo-1594922119106-93d3957ce32b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1627581903964-672ce34f2a5b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585237303023-e18d6a8e8f85?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 25 }
  },
  {
    name: 'Stainless Steel 5-Quart Dutch Oven',
    slug: 'stainless-5-qt-dutch-oven',
    description: 'Premium triple-ply stainless steel dutch oven with matching lid. Professional-grade heat distribution for stews.',
    brand: 'CulinaryPro',
    category: 'cookware',
    subCategory: 'Pots',
    price: { selling: 129.50 },
    attributes: { material: 'Stainless Steel', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1520981825232-ece5faeecdb5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579219357053-1574a4cf962e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588190565860-fe6ae59a0b9a?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 15 }
  },
  {
    name: 'Enameled Cast Iron Dutch Oven (6 Qt)',
    slug: 'enameled-cast-iron-dutch-oven',
    description: 'A beautiful 6-quart enameled cast iron dutch oven that transitions perfectly from oven to table.',
    brand: 'LeCrucible',
    category: 'cookware',
    subCategory: 'Pots',
    price: { selling: 299.99 },
    attributes: { material: 'Enameled Cast Iron', color: 'Flame Red' },
    images: [
      'https://images.unsplash.com/photo-1596767746142-bba71b8ee2ec?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1627581903964-672ce34f2a5b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624462966581-bc567d58f557?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582236319159-281b37f37478?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 8 }
  },
  {
    name: 'Copper Core 2-Quart Saucepan',
    slug: 'copper-core-saucepan-2qt',
    description: 'Ultra-responsive copper core saucepan built for delicate sauces, melting butter, or reducing glazes.',
    brand: 'CulinaryPro',
    category: 'cookware',
    subCategory: 'Pots',
    price: { selling: 145.00 },
    attributes: { material: 'Copper/Steel', color: 'Copper/Silver' },
    images: [
      'https://images.unsplash.com/photo-1602758162817-26d9e03d92fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540932239922-db3ee4f3fb05?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 10 }
  },

  // Bakeware
  {
    name: 'Silicone Baking Mat Set (2 Pack)',
    slug: 'silicone-baking-mat-set',
    description: 'Reusable non-stick silicone baking mats to line your half-sheet pans. Perfect for cookies and roasted vegetables.',
    brand: 'BakeWell',
    category: 'bakeware',
    subCategory: 'Accessories',
    price: { selling: 19.99 },
    attributes: { material: 'Silicone', color: 'Red/Brown' },
    images: [
      'https://images.unsplash.com/photo-1563212036-7c91ca73c4f7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1587849646450-482457cb1475?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 150 }
  },
  {
    name: 'Aluminized Steel Half Sheet Pan',
    slug: 'aluminized-steel-half-sheet-pan',
    description: 'A heavy-gauge structured baking pan resists warping and conducts heat evenly. The choice of commercial bakeries.',
    brand: 'OvenMaster',
    category: 'bakeware',
    subCategory: 'Pans',
    price: { selling: 22.50 },
    attributes: { material: 'Aluminized Steel', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1588190565860-fe6ae59a0b9a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624462966581-bc567d58f557?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582285141103-625d97f53488?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 80 }
  },
  {
    name: 'Non-Stick 9" Springform Pan',
    slug: 'non-stick-9-springform-pan',
    description: 'The absolute essential pan for cheesecakes. Featuring an interlocking spring clamp and leak-proof seal.',
    brand: 'BakeWell',
    category: 'bakeware',
    subCategory: 'Pans',
    price: { selling: 18.00 },
    attributes: { material: 'Carbon Steel', color: 'Dark Grey' },
    images: [
      'https://images.unsplash.com/photo-1579306194872-64d3b7bcacaa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 45 }
  },
  {
    name: 'Heavy Steel 12-Cup Muffin Tin',
    slug: 'heavy-steel-muffin-tin',
    description: 'Bake perfect cupcakes and muffins consistently with this thick steel tin that ensures even browning.',
    brand: 'OvenMaster',
    category: 'bakeware',
    subCategory: 'Pans',
    price: { selling: 24.00 },
    attributes: { material: 'Carbon Steel', color: 'Navy Blue' },
    images: [
      'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1615865426176-808386dece13?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565557623262-b51f08bd4aeb?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 60 }
  },

  // Furniture
  {
    name: 'Mid-Century Dining Chair (Set of 2)',
    slug: 'mid-century-dining-chair-set-2',
    description: 'Ergonomic bentwood seating with walnut finish and genuine leather upholstery. Stunning addition to open-concept spaces.',
    brand: 'Hearth & Home',
    category: 'furniture',
    subCategory: 'Seating',
    price: { selling: 149.99, original: 199.99 },
    attributes: { material: 'Wood / Leather', color: 'Walnut / Black' },
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540932239922-db3ee4f3fb05?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 20 }
  },
  {
    name: 'Rustic Solid Oak Kitchen Island',
    slug: 'rustic-solid-oak-island',
    description: 'A massive prep sanctuary. Featuring thick solid oak top, lockable caster wheels, 3 deep drawers, and a built-in towel rack.',
    brand: 'Hearth & Home',
    category: 'furniture',
    subCategory: 'Tables',
    price: { selling: 499.00 },
    attributes: { material: 'Solid Oak', color: 'Natural Wood' },
    images: [
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 4 }
  },
  {
    name: 'Minimalist Bar Stool',
    slug: 'minimalist-bar-stool',
    description: 'Matte black steel framed bar stool with a low-profile backrest. Perfect for under-counter storage.',
    brand: 'UrbanLoft',
    category: 'furniture',
    subCategory: 'Seating',
    price: { selling: 85.00 },
    attributes: { material: 'Powder-coated Steel', color: 'Matte Black' },
    images: [
      'https://images.unsplash.com/photo-1582236319159-281b37f37478?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598348873729-1a9be2ee3428?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 40 }
  },

  // Dining
  {
    name: 'Stoneware Dinner Plates (Set of 4)',
    slug: 'stoneware-dinner-plates-set',
    description: 'Hand-glazed organic shaped stoneware plates. Scratch-resistant matte finish that grounds any tablescape.',
    brand: 'Earth Table',
    category: 'dining',
    subCategory: 'Tableware',
    price: { selling: 45.00 },
    attributes: { material: 'Stoneware', color: 'Charcoal' },
    images: [
      'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1615865426176-808386dece13?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565557623262-b51f08bd4aeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555541604-c3c1e21b0bc4?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 120 }
  },
  {
    name: 'Crystal Wine Glasses (Set of 2)',
    slug: 'crystal-wine-glasses-set-2',
    description: 'Elegant, ultra-thin stemware drafted specifically to optimize the bouquet of red varietals.',
    brand: 'VinoLuxe',
    category: 'dining',
    subCategory: 'Drinkware',
    price: { selling: 38.00 },
    attributes: { material: 'Lead-Free Crystal', color: 'Clear' },
    images: [
      'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555541604-c3c1e21b0bc4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622316493902-60b731dd0c3f?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 85 }
  },
  {
    name: 'Modern Gold Flatware Set (20 Piece)',
    slug: 'modern-gold-flatware-20pc',
    description: 'Service for 4. Brushed gold stainless steel flatware providing weight, balance, and stunning contemporary contrast.',
    brand: 'Earth Table',
    category: 'dining',
    subCategory: 'Cutlery',
    price: { selling: 110.00 },
    attributes: { material: 'Stainless Steel', color: 'Brushed Gold' },
    images: [
      'https://images.unsplash.com/photo-1622316493902-60b731dd0c3f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622316492341-a185b3bc9194?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618685149306-25f05b9b1836?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 50 }
  },

  // Decor
  {
    name: 'Hand-Poured Soy Wax Candle',
    slug: 'hand-poured-soy-candle',
    description: 'A 60-hour burn candle featuring an oakmoss and amber scent profile housed in an amber glass jar.',
    brand: 'Lumen',
    category: 'decor',
    subCategory: 'Candles',
    price: { selling: 24.00 },
    attributes: { material: 'Soy Wax', color: 'Amber' },
    images: [
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598348873729-1a9be2ee3428?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584589167171-54764e04111f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 200 }
  },
  {
    name: 'Marble Fruit Bowl',
    slug: 'marble-fruit-bowl',
    description: 'Weighty, minimalist bowl carved from a single block of Carrara marble. An arresting centerpiece.',
    brand: 'Stone & Style',
    category: 'decor',
    subCategory: 'Centerpieces',
    price: { selling: 85.00 },
    attributes: { material: 'Carrara Marble', color: 'White/Grey' },
    images: [
      'https://images.unsplash.com/photo-1582285141103-625d97f53488?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 12 }
  }
];

async function seedProducts() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);
  console.log('Connected! Emptying products collection strictly...');
  
  // They said they deleted everything, but let's be sure to clear it so exactly 25 items are there.
  await Product.deleteMany({});
  
  let insertedCounts = 0;
  for (const p of products) {
    console.log(`Inserting: ${p.name}`);
    const newProd = await Product.create(p);
    insertedCounts++;
    console.log('  Generating embeddings...');
    try {
      const embedding = await embedProduct(newProd);
      if (embedding.length) {
        await Product.updateOne({ _id: newProd._id }, { $set: { embedding } });
        console.log('  Embeddings saved.');
      }
    } catch (err) {
       console.warn('  Could not embed product.', err);
    }
  }

  console.log(`\\n✅ Successfully seeded ${insertedCounts} rich items!`);
  await mongoose.disconnect();
}

void seedProducts();
