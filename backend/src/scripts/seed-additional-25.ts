import mongoose from 'mongoose';
import { env } from '../config/env';
import Product from '../models/Product';
import { embedProduct } from '../services/productEmbedding.service';

const products = [
  // Kitchen Tools
  {
    name: 'Heavy Duty Garlic Press',
    slug: 'heavy-duty-garlic-press',
    description: 'Crush garlic effortlessly. Made from heavy die-cast zinc with ergonomic handles that absorb pressure.',
    brand: 'CulinaryPro',
    category: 'kitchen tools',
    subCategory: 'Gadgets',
    price: { selling: 18.00 },
    attributes: { material: 'Zinc Alloy', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1581007871115-f14bfbc3dece?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582285141103-625d97f53488?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618685149306-25f05b9b1836?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 80 }
  },
  {
    name: 'Citrus Squeezer Press',
    slug: 'citrus-squeezer-press',
    description: 'Extract every last drop of juice from lemons and limes without the seeds. Enamel coated aluminum.',
    brand: 'PrepWell',
    category: 'kitchen tools',
    subCategory: 'Gadgets',
    price: { selling: 14.50 },
    attributes: { material: 'Aluminum', color: 'Yellow' },
    images: [
      'https://images.unsplash.com/photo-1594922119106-93d3957ce32b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1627581903964-672ce34f2a5b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584984244243-7ec97e4cabd1?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 150 }
  },
  {
    name: 'Stainless Steel Measuring Cups (Set of 5)',
    slug: 'stainless-measuring-cups',
    description: 'Nesting measuring cups with engraved measurements that never wash off. Includes 1/8 cup to 1 cup.',
    brand: 'EcoCook',
    category: 'kitchen tools',
    subCategory: 'Baking Tools',
    price: { selling: 22.00 },
    attributes: { material: 'Stainless Steel', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1576426463991-3252c1feebac?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585237303023-e18d6a8e8f85?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 90 }
  },
  {
    name: 'Magnetic Measuring Spoons Set',
    slug: 'magnetic-measuring-spoons',
    description: 'Dual-sided measuring spoons that snap together magnetically for easy drawer storage.',
    brand: 'EcoCook',
    category: 'kitchen tools',
    subCategory: 'Baking Tools',
    price: { selling: 16.00 },
    attributes: { material: 'Stainless Steel', color: 'Silver/Black' },
    images: [
      'https://images.unsplash.com/photo-1584907600868-b32ffc958617?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546875887-f131102b4d24?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 200 }
  },
  {
    name: 'Large Salad Spinner 5Qt',
    slug: 'large-salad-spinner',
    description: 'Quickly wash and dry delicate greens. Features a built-in brake and a bowl that doubles for serving.',
    brand: 'PrepWell',
    category: 'kitchen tools',
    subCategory: 'Gadgets',
    price: { selling: 35.00 },
    attributes: { material: 'BPA-Free Plastic', color: 'Clear/White' },
    images: [
      'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565557623262-b51f08bd4aeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1615865426176-808386dece13?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 45 }
  },
  {
    name: 'Heavy-Duty Kitchen Shears',
    slug: 'heavy-duty-kitchen-shears',
    description: 'Multi-purpose culinary scissors that cut through herbs, packaging, and even chicken bones. Comes-apart for cleaning.',
    brand: 'CulinaryPro',
    category: 'kitchen tools',
    subCategory: 'Utensils',
    price: { selling: 19.99 },
    attributes: { material: 'Carbon Steel', color: 'Black' },
    images: [
      'https://images.unsplash.com/photo-1588190565860-fe6ae59a0b9a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579219357053-1574a4cf962e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1520981825232-ece5faeecdb5?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 95 }
  },

  // Cookware
  {
    name: 'Carbon Steel Wok 14"',
    slug: 'carbon-steel-wok-14',
    description: 'Traditional hand-hammered 14-inch carbon steel wok. Heats up incredibly fast for authentic stir-fry.',
    brand: 'WokMaster',
    category: 'cookware',
    subCategory: 'Pans',
    price: { selling: 55.00 },
    attributes: { material: 'Carbon Steel', color: 'Dark Iron' },
    images: [
      'https://images.unsplash.com/photo-1596767746142-bba71b8ee2ec?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624462966581-bc567d58f557?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614278453715-188b8ccfde90?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 30 }
  },
  {
    name: 'Pro Stainless Steel Skillet 10"',
    slug: 'pro-stainless-skillet-10',
    description: 'Tri-ply clad 10-inch frying pan. Offers the perfect combination of searing power and even heating without non-stick coatings.',
    brand: 'CulinaryPro',
    category: 'cookware',
    subCategory: 'Pans',
    price: { selling: 85.00 },
    attributes: { material: 'Stainless Steel', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1583337260546-28b61e2cc6c5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1627581903964-672ce34f2a5b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563212036-7c91ca73c4f7?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 20 }
  },
  {
    name: 'Reversible Cast Iron Griddle',
    slug: 'reversible-cast-iron-griddle',
    description: 'Double burner reversible grill/griddle pan. Perfect for pancakes on one side, and searing steaks on the other.',
    brand: 'LodgeMaster',
    category: 'cookware',
    subCategory: 'Pans',
    price: { selling: 59.99 },
    attributes: { material: 'Cast Iron', color: 'Black' },
    images: [
      'https://images.unsplash.com/photo-1555541604-c3c1e21b0bc4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584907600868-b32ffc958617?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 25 }
  },
  {
    name: 'Authentic Spanish Paella Pan 15"',
    slug: 'authentic-spanish-paella-pan',
    description: 'Dimpled carbon steel pan designed strictly for forming the perfect crispy rice socarrat.',
    brand: 'VinoLuxe',
    category: 'cookware',
    subCategory: 'Pans',
    price: { selling: 42.00 },
    attributes: { material: 'Polished Steel', color: 'Silver/Red Handles' },
    images: [
      'https://images.unsplash.com/photo-1594922119106-93d3957ce32b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588190565860-fe6ae59a0b9a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1627581903964-672ce34f2a5b?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 18 }
  },
  {
    name: '12-Quart Stainless Steel Stockpot',
    slug: '12qt-stainless-stockpot',
    description: 'Massive stockpot for boiling lobsters, creating bone broths, or cooking pasta for a crowd. Includes tight-fitting lid.',
    brand: 'CulinaryPro',
    category: 'cookware',
    subCategory: 'Pots',
    price: { selling: 115.00 },
    attributes: { material: 'Stainless Steel', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1520981825232-ece5faeecdb5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579219357053-1574a4cf962e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546875887-f131102b4d24?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 12 }
  },

  // Bakeware
  {
    name: 'Aluminized Steel Loaf Pan',
    slug: 'aluminized-steel-loaf-pan',
    description: 'Commercial 1lb loaf pan mimicking the performance of a professional bakery for perfect sandwich bread or banana bread.',
    brand: 'OvenMaster',
    category: 'bakeware',
    subCategory: 'Pans',
    price: { selling: 16.50 },
    attributes: { material: 'Aluminized Steel', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1587849646450-482457cb1475?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579306194872-64d3b7bcacaa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624462966581-bc567d58f557?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 150 }
  },
  {
    name: 'Classic Fluted Bundt Pan',
    slug: 'classic-fluted-bundt-pan',
    description: 'Heavy cast aluminum provides superior baking performance and sharply defined details for pound cakes.',
    brand: 'BakeWell',
    category: 'bakeware',
    subCategory: 'Pans',
    price: { selling: 38.00 },
    attributes: { material: 'Cast Aluminum', color: 'Silver' },
    images: [
      'https://images.unsplash.com/photo-1618685149306-25f05b9b1836?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584589167171-54764e04111f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 38 }
  },
  {
    name: 'Square Ceramic Baking Dish 8x8',
    slug: 'square-ceramic-baking-dish',
    description: 'Classic 8x8 white ceramic dish. Essential for brownies, small casseroles, and crumbles. Completely freezer-to-oven safe.',
    brand: 'Earth Table',
    category: 'bakeware',
    subCategory: 'Dishes',
    price: { selling: 32.00 },
    attributes: { material: 'Ceramic', color: 'Glossy White' },
    images: [
      'https://images.unsplash.com/photo-1563212036-7c91ca73c4f7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 65 }
  },
  {
    name: 'Stainless Steel Cooling Rack',
    slug: 'stainless-cooling-rack',
    description: 'Wire grid cooling rack fits perfectly inside standard half-sheet pans. Oven-safe for roasting bacon or cooling cookies.',
    brand: 'OvenMaster',
    category: 'bakeware',
    subCategory: 'Accessories',
    price: { selling: 18.00 },
    attributes: { material: 'Stainless Steel', color: 'Wire Chrome' },
    images: [
      'https://images.unsplash.com/photo-1588190565860-fe6ae59a0b9a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622316493902-60b731dd0c3f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596767746142-bba71b8ee2ec?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 180 }
  },
  {
    name: 'French Tapered Wooden Rolling Pin',
    slug: 'french-tapered-rolling-pin',
    description: 'Handle-less solid wood pin allowing you to pivot easily and feel the thickness of pasta, tart dough, or pie crusts.',
    brand: 'BakeWell',
    category: 'bakeware',
    subCategory: 'Tools',
    price: { selling: 22.00 },
    attributes: { material: 'Maple Wood', color: 'Light Wood' },
    images: [
      'https://images.unsplash.com/photo-1602758162817-26d9e03d92fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594922119106-93d3957ce32b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563212036-7c91ca73c4f7?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 50 }
  },

  // Dining
  {
    name: 'Organic Ceramic Bowls (Set of 4)',
    slug: 'organic-ceramic-bowls-4',
    description: 'Perfectly sized bowls for ramen, cereal, or big salads. Crafted with an asymmetrical artisanal rim.',
    brand: 'Earth Table',
    category: 'dining',
    subCategory: 'Tableware',
    price: { selling: 40.00 },
    attributes: { material: 'Ceramic', color: 'Speckled White' },
    images: [
      'https://images.unsplash.com/photo-1615865426176-808386dece13?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565557623262-b51f08bd4aeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 130 }
  },
  {
    name: 'Washed Linen Table Runner',
    slug: 'washed-linen-table-runner',
    description: '108" extra long table runner in 100% Belgian linen. Falls beautifully with elegantly fringed ends.',
    brand: 'Hearth & Home',
    category: 'dining',
    subCategory: 'Linens',
    price: { selling: 48.00 },
    attributes: { material: 'Linen', color: 'Mustard Yellow' },
    images: [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540932239922-db3ee4f3fb05?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 45 }
  },
  {
    name: 'Crystal Highball Glasses (Set of 4)',
    slug: 'crystal-highball-glasses-4',
    description: 'Tall, minimalist crystal glasses with heavyweight bases. Perfect for mojitos, sparkling water, or iced tea.',
    brand: 'VinoLuxe',
    category: 'dining',
    subCategory: 'Drinkware',
    price: { selling: 55.00 },
    attributes: { material: 'Crystal', color: 'Clear' },
    images: [
      'https://images.unsplash.com/photo-1555541604-c3c1e21b0bc4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583337260546-28b61e2cc6c5?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 80 }
  },
  {
    name: 'Hand-blown Wine Decanter',
    slug: 'hand-blown-wine-decanter',
    description: 'A wide-base swan neck decanter providing maximum aeration for vintage and young full-bodied red wines.',
    brand: 'VinoLuxe',
    category: 'dining',
    subCategory: 'Drinkware',
    price: { selling: 65.00 },
    attributes: { material: 'Crystal Glass', color: 'Clear' },
    images: [
      'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588190565860-fe6ae59a0b9a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622316493902-60b731dd0c3f?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 20 }
  },
  {
    name: 'Olive Wood Serving Platter',
    slug: 'olive-wood-serving-platter',
    description: 'Live-edge Mediterranean olive wood board. Beautifully unique grain perfect for massive charcuterie spreads.',
    brand: 'ForestEdge',
    category: 'dining',
    subCategory: 'Serveware',
    price: { selling: 75.00 },
    attributes: { material: 'Solid Olive Wood', color: 'Natural Wood' },
    images: [
      'https://images.unsplash.com/photo-1602758162817-26d9e03d92fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594922119106-93d3957ce32b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563212036-7c91ca73c4f7?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 30 }
  },

  // Decor
  {
    name: 'Textured Ceramic Vase',
    slug: 'textured-ceramic-vase',
    description: '14" tall unglazed ribbed ceramic vase. Breathtaking statement piece for long-stem pampas or hydrangeas.',
    brand: 'Stone & Style',
    category: 'decor',
    subCategory: 'Vases',
    price: { selling: 58.00 },
    attributes: { material: 'Ceramic', color: 'Matte Earth' },
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582285141103-625d97f53488?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618685149306-25f05b9b1836?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 40 }
  },
  {
    name: 'Minimalist Wood Wall Clock',
    slug: 'minimalist-wood-wall-clock',
    description: 'Simple 12" face with no numbers. Quiet sweep second hand and crafted entirely from sustainably sourced bamboo.',
    brand: 'UrbanLoft',
    category: 'decor',
    subCategory: 'Wall Art',
    price: { selling: 45.00 },
    attributes: { material: 'Bamboo', color: 'Light Wood' },
    images: [
      'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598348873729-1a9be2ee3428?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582236319159-281b37f37478?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 60 }
  },
  {
    name: 'Linen Bound Decorative Books (Set of 3)',
    slug: 'linen-bound-decorative-books',
    description: 'Blank journals wrapped in luxurious raw linen to bring height and texture to your bookshelf or coffee table styling.',
    brand: 'Hearth & Home',
    category: 'decor',
    subCategory: 'Tabletop',
    price: { selling: 35.00 },
    attributes: { material: 'Paper / Linen', color: 'Neutral Tones' },
    images: [
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584589167171-54764e04111f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565557623262-b51f08bd4aeb?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 120 }
  },

  // Furniture
  {
    name: 'Boucle Accent Lounge Chair',
    slug: 'boucle-accent-lounge-chair',
    description: 'Dramatically sculpted barrel chair wrapped in soft, highly textured boucle fabric perfect for a cozy reading nook.',
    brand: 'UrbanLoft',
    category: 'furniture',
    subCategory: 'Seating',
    price: { selling: 399.00 },
    attributes: { material: 'Boucle / Foam / Steel', color: 'Cream White' },
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540932239922-db3ee4f3fb05?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=800'
    ],
    stock: { status: 'IN_STOCK', quantity: 15 }
  }
];

async function seedProducts() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);
  console.log('Connected! Retaining old stuff and adding 25 new items...');
  
  let insertedCounts = 0;
  for (const p of products) {
    const existing = await Product.findOne({ slug: p.slug });
    if (!existing) {
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
    } else {
      console.log(`Skipping: ${p.name} (already exists)`);
    }
  }

  console.log(`\\n✅ Successfully seeded ${insertedCounts} additional items! Total should now be 50 if none blocked.`);
  await mongoose.disconnect();
}

void seedProducts();
