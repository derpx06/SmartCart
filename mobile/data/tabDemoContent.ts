export type TabDemoContent = {
  tabName: string;
  description: string;
  iconName: 'restaurant-outline' | 'gift-outline' | 'car-outline' | 'cart-outline';
  items: { title: string; detail: string }[];
};

export const recipeDemoContent: TabDemoContent = {
  tabName: 'Recipe',
  description: 'Discover practical recipes linked with tools and ingredients to buy.',
  iconName: 'restaurant-outline',
  items: [
    {
      title: 'Chef Picks',
      detail: 'Highlight premium recipe cards that fit your brand style and season.',
    },
    {
      title: 'Cook Time Filters',
      detail: 'Let users find quick meals or long-format weekend recipes in seconds.',
    },
    {
      title: 'Shoppable Steps',
      detail: 'Connect each ingredient or cookware item to product detail flows.',
    },
  ],
};

export const registryDemoContent: TabDemoContent = {
  tabName: 'Registry',
  description: 'Create and manage gift registries with premium onboarding and tracking.',
  iconName: 'gift-outline',
  items: [
    {
      title: 'Event Setup',
      detail: 'Capture occasion, shipping preferences, and target date in guided steps.',
    },
    {
      title: 'Gift Progress',
      detail: 'Show real-time item fulfillment and remaining wishlist priorities.',
    },
    {
      title: 'Guest Sharing',
      detail: 'Generate share links and personalized registry messages for guests.',
    },
  ],
};

export const ordersDemoContent: TabDemoContent = {
  tabName: 'Orders',
  description: 'Track shipments, returns, and support status in one clean timeline.',
  iconName: 'car-outline',
  items: [
    {
      title: 'Live Tracking',
      detail: 'Display courier progress updates with clear delivery estimates.',
    },
    {
      title: 'Order History',
      detail: 'Group purchase events by date with payment and invoice metadata.',
    },
    {
      title: 'Support Actions',
      detail: 'Expose return, exchange, and help entry points directly in each order.',
    },
  ],
};

export const cartDemoContent: TabDemoContent = {
  tabName: 'Cart',
  description: 'Convert faster with a polished cart summary and checkout readiness cues.',
  iconName: 'cart-outline',
  items: [
    {
      title: 'Item Grouping',
      detail: 'Organize line items by fulfillment type and expected arrival window.',
    },
    {
      title: 'Promo Handling',
      detail: 'Apply offers and loyalty credits with immediate pricing updates.',
    },
    {
      title: 'Checkout CTA',
      detail: 'Pin a strong call-to-action with delivery promise and trust signals.',
    },
  ],
};
