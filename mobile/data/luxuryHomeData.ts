export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  image: string;
};

export type CategoryItem = {
  id: string;
  title: string;
  image: string;
};

export type CollectionItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

export type ProductItem = {
  id: string;
  name: string;
  price: string;
  rating: number;
  image: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    title: 'Elevate Everyday Cooking',
    subtitle: 'Crafted tools and timeless forms for a kitchen that feels intentional.',
    ctaLabel: 'Shop Collection',
    image:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'hero-2',
    title: 'Refined Dining, Effortlessly',
    subtitle: 'Understated tableware designed for gatherings worth remembering.',
    ctaLabel: 'Discover Dining',
    image:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'hero-3',
    title: 'Quiet Luxury For Home',
    subtitle: 'Thoughtful materials and precision finishes inspired by modern ateliers.',
    ctaLabel: 'Explore New Arrivals',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80',
  },
];

export const categories: CategoryItem[] = [
  {
    id: 'cat-1',
    title: 'Cookware',
    image:
      'https://images.unsplash.com/photo-1584990347449-a4d86b8a35d4?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cat-2',
    title: 'Bakeware',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cat-3',
    title: 'Kitchen Tools',
    image:
      'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cat-4',
    title: 'Dining',
    image:
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cat-5',
    title: 'Furniture',
    image:
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cat-6',
    title: 'Decor',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  },
];

export const collections: CollectionItem[] = [
  {
    id: 'col-1',
    title: 'Spring Kitchen Edit',
    subtitle: 'Light textures, artisan ceramics, and elevated prep essentials.',
    image:
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'col-2',
    title: "Chef's Essentials",
    subtitle: 'Performance-grade knives, pans, and prep tools chosen by professionals.',
    image:
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'col-3',
    title: 'Modern Dining',
    subtitle: 'Minimal silhouettes and warm finishes for intimate hosting.',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  },
];

export const bestsellers: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Tri-Ply Copper Core Saute Pan',
    price: '$189',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1583778176476-4a8b02a64c86?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-2',
    name: 'Stoneware Nesting Bake Set',
    price: '$124',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-3',
    name: 'Olivewood Prep Board',
    price: '$98',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1506368083636-6defb67639a7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-4',
    name: 'Brushed Gold Flatware Set',
    price: '$164',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80',
  },
];

export const recommendedProducts: ProductItem[] = [
  {
    id: 'rec-1',
    name: 'Chef Select Dutch Oven',
    price: '$210',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rec-2',
    name: 'Hand-Glazed Dinner Plate Set',
    price: '$136',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rec-3',
    name: 'Signature Espresso Machine',
    price: '$529',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rec-4',
    name: 'Walnut Serving Tray',
    price: '$87',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=900&q=80',
  },
];
