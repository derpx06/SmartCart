export interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
  category: string;
  description: string;
  imageUrl: string;
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
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  items: OrderItem[];
}
