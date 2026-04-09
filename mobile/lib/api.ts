import { Config } from '@/constants/Config';
import type { TabDemoContent } from '@/data/tabDemoContent';
import type { ProductDetail } from '@/data/product/productDetails';
import type { CategoryItem, CollectionItem, HeroSlide, ProductItem } from '@/data/luxuryHomeData';
import type { RankedItem } from '@/types/smart-cart';

let authToken: string | null = null;

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(`${Config.API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  setToken(token: string | null) {
    authToken = token;
  },
  getToken() {
    return authToken;
  },
  login(email: string, password: string) {
    return request<{ token: string; userId: string; name: string }>('/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });
  },
  register(name: string, email: string, password: string) {
    return request<{ token: string; userId: string; name: string }>('/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ name, email, password }),
    });
  },
  getHome() {
    return request<{
      heroSlides: HeroSlide[];
      categories: CategoryItem[];
      collections: CollectionItem[];
      bestsellers: ProductItem[];
      recommendedProducts: ProductItem[];
    }>('/home');
  },
  getProductBySlug(slug: string) {
    return request<ProductDetail>(`/products/slug/${slug}`);
  },
  addToCart(productId: string, quantity: number) {
    return request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },
  updateCart(productId: string, quantity: number) {
    return request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },
  checkout() {
    return request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
  getOrders() {
    return request<Array<{
      id: string;
      customerName: string;
      total: number;
      status: string;
      date: string;
      items: { name: string; quantity: number }[];
    }>>('/orders/mobile');
  },
  getRecipes() {
    return request<TabDemoContent>('/recipes');
  },
  getRegistries() {
    return request<TabDemoContent>('/registries');
  },
  addToWishlist(productId: string) {
    return request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
  getProductRecommendations(productId: string) {
    return request<RankedItem[]>(`/products/${productId}/recommendations`);
  },
};
