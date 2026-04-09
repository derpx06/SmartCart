import { createContext, useContext, useState, type ReactNode } from 'react';

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
  status: 'Pending' | 'Shipped' | 'Delivered';
  date: string;
  items: OrderItem[];
}

interface DataContextType {
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  getInsights: () => { totalSales: number; popularProduct: Product | null; leastSoldProduct: Product | null };
}

const initialProducts: Product[] = [
  { id: '1', name: 'Premium Wireless Headphones', price: 299.99, inventory: 45, category: 'Electronics', description: 'Studio-quality audio with advanced noise cancellation.', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { id: '2', name: 'Mechanical Keyboard', price: 149.99, inventory: 12, category: 'Electronics', description: 'Tactile switches with vibrant RGB lighting.', imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80' },
  { id: '3', name: 'Ergonomic Desk Chair', price: 499.00, inventory: 5, category: 'Furniture', description: 'All-day comfort with lumbar support.', imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0ad766207?w=800&q=80' },
  { id: '4', name: 'Smart Fitness Watch', price: 199.50, inventory: 80, category: 'Wearables', description: 'Track your health and workouts in style.', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
];

const initialOrders: Order[] = [
  { 
    id: 'ORD-001', 
    customerName: 'Alex Johnson', 
    total: 299.99, 
    status: 'Pending', 
    date: '2026-04-09',
    items: [{ productId: '1', name: 'Premium Wireless Headphones', quantity: 1, price: 299.99 }]
  },
  { 
    id: 'ORD-002', 
    customerName: 'Maria Garcia', 
    total: 648.99, 
    status: 'Shipped', 
    date: '2026-04-08',
    items: [
      { productId: '2', name: 'Mechanical Keyboard', quantity: 1, price: 149.99 },
      { productId: '3', name: 'Ergonomic Desk Chair', quantity: 1, price: 499.00 }
    ]
  },
  { 
    id: 'ORD-003', 
    customerName: 'James Wilson', 
    total: 149.99, 
    status: 'Delivered', 
    date: '2026-04-05',
    items: [{ productId: '2', name: 'Mechanical Keyboard', quantity: 1, price: 149.99 }]
  },
];

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct = { ...p, id: Date.now().toString() };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const getInsights = () => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const popularProduct = products[0] || null; // Mock Logic
    const leastSoldProduct = products[products.length - 1] || null; // Mock Logic
    return { totalSales, popularProduct, leastSoldProduct };
  };

  return (
    <DataContext.Provider value={{
      products, orders, addProduct, updateProduct, removeProduct, updateOrderStatus, getInsights
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
