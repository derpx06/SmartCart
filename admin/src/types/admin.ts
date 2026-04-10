export interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
  category: string;
  description: string;
  images: string[];
  tags: string[];
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'Ordered' | 'On the way' | 'Delivered' | 'Failed';
  date: string;
  items: OrderItem[];
}

export interface Model3D {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  format: string;
  size: number;
  productId?: string;
  createdAt: string;
  updatedAt: string;
}
