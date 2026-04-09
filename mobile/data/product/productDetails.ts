export type ProductReview = {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  rating: number;
  verified: boolean;
};

export type RelatedProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export type ProductDetail = {
  slug: string;
  brand: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge: string;
  shippingLine: string;
  shippingEta: string;
  description: string;
  features: string[];
  colors: { id: string; name: string; hex: string }[];
  selectedColorId: string;
  sizes: string[];
  selectedSize: string;
  images: string[];
  related: RelatedProduct[];
  reviews: ProductReview[];
};

const dutchOven: ProductDetail = {
  slug: 'signature-enameled-cast-iron-dutch-oven',
  brand: 'THE CULINARY ATELIER',
  name: 'Signature Enameled Cast Iron Dutch Oven',
  price: 320,
  originalPrice: 380,
  rating: 4.8,
  reviewCount: 124,
  badge: 'Limited Edition',
  shippingLine: 'Free White-Glove Shipping',
  shippingEta: 'Estimated delivery: Oct 24 - Oct 27',
  description:
    'Meticulously crafted at our individual foundry in northern France since 1925, each Dutch Oven is cast in a sand mold and inspected by French artisans. This iconic piece is indispensable in the kitchens of home cooks and professional chefs alike.',
  features: ['Premium Heat Retention', 'Easy Cleaning Enameled Surface', 'Ergonomic Stay-Cool Knobs'],
  colors: [
    { id: 'deep-sea', name: 'Deep Sea', hex: '#1a365d' },
    { id: 'cloud', name: 'Cloud', hex: '#d1d5db' },
    { id: 'cherry', name: 'Cherry', hex: '#c53030' },
  ],
  selectedColorId: 'deep-sea',
  sizes: ['4.5 qt', '5.5 qt', '7.25 qt'],
  selectedSize: '5.5 qt',
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDuyk3Jpr2xpLZ3YI8_fjaqTzjkUV2BjOjYrvWGmOra7U5t5ECnYF8ZMKFA3gSkhtRL4BkQRnoNQcelch8kLeYf9o5M7tjfORvv8WbefuBgXGH4BvLkN_qNoDG_p8MHs8Qhdn-3224zm-iIdKkZvv8npfOUY7-l6UqvlP38YQgc6v4Ic3APZKs8WpMTzis0kVdfn6UV0J_-x9t-CuUC47Oiwr_r5cUevpNK53T4iK7M9_q_8pcW6Te5KKdEdlgUgReupP-vg8uPcSVv',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=900&q=80',
  ],
  related: [
    {
      id: 'iron-skillet',
      name: 'Iron Skillet',
      price: '$180.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAdJ2QZoaRdYd1qS5dpCSCSPqHA5Ocw2e4TKVYzI0IWKQr4BM5kEzMlzRou7a_uYZtqi2oCh1O9ZSXhCPP6QdhSz9dNTr30o4VrrS23VtAThIigQA9QkgOFC7MwUm4wDrTY6pWd5pdaVks3WCsD33FPOI6AJCdbOlwSZaScrK6xJxETJvS_JutuDA0s2ne9vhhZxaU9_GWx3-hE0S2gBXNeZeew4kx1nSi_Moik0JEyF3NqSXRR_k4isNjaax8bHxcS7_5-_0ryWYQm',
    },
    {
      id: 'signature-braiser',
      name: 'Signature Braiser',
      price: '$290.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBRnJo4OWPEDyrhWTsY31YUWpohi-YoJ1vb3oAf_LOwkaf1TR5wUiUq5Efr0hqOUwtB-yw2J71t02AONH_3G5T7QjZOqJdKPkAuqx0tqaj_LY7SHVP77cJULpvsNgv4yDW0eempU_KvWcgkPLy2WM7JP9zqDQcaNdGNFmTZ_xDV9QJZW6UrwC9jVaA5xW8oxTEOfFaFDMb8fBb5-PRlvonWh6pk9cAcfhzH-s_rPVFTG3Zuj2YKxfklTjA11pGZFUyfY4DhQpsmcR2x',
    },
    {
      id: 'saucier-pan',
      name: 'Saucier Pan',
      price: '$210.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBUfMEvZ5vZsLyBkQOX7JJ-9HxnzY-jpbSdEmlZ6L9HfYSD6hXmIgA9aG2uFZAHuug6wpNLHHtsHWBInzDNw0FmeVkF6RCzLFDNVCVq2lFWkur1mKR3wvl2McoFLBNA6KHRuDsJGLCf20Kzwp29hEAUUnK4XzP5BajsIIk_iZLwPKo6NwYZmMLVj4TmwF6hul2T5bHPKI7qFIcBbACD5PAusNNGb5syUNpSGi30acYwQkaQnxW4Op4PdN8PEWYcl7uP-wPDAM4zBNto',
    },
  ],
  reviews: [
    {
      id: 'review-1',
      title: 'Heritage piece for my kitchen.',
      body: 'Absolutely stunning quality. The heat distribution is unparalleled. Worth every penny of the investment.',
      author: 'Julian R.',
      date: 'Oct 12, 2023',
      rating: 5,
      verified: true,
    },
  ],
};

export const productDetailsBySlug: Record<string, ProductDetail> = {
  [dutchOven.slug]: dutchOven,
};

export const defaultProductDetail = dutchOven;
