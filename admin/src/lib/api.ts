const API_URL = 'http://localhost:3001';
const TOKEN_KEY = 'smartcart-admin-token';

function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
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

export const adminApi = {
  getStoredToken: getToken,
  login(email: string, password: string) {
    return request<{ token: string; name: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  getDashboard() {
    return request('/admin/dashboard');
  },
  getProducts() {
    return request('/admin/products');
  },
  getProduct(id: string) {
    return request(`/admin/products/${id}`);
  },
  createProduct(payload: object) {
    return request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateProduct(id: string, payload: object) {
    return request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteProduct(id: string) {
    return request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
  getOrders() {
    return request('/admin/orders');
  },
  getOrder(id: string) {
    return request(`/admin/orders/${id}`);
  },
  updateOrder(id: string, payload: Partial<any>) {
    return request(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  updateOrderStatus(id: string, status: string) {
    return request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  getModels3D() {
    return request('/admin/models3d');
  },
  uploadModel3D(formData: FormData) {
    // For FormData, we let the browser set the boundary and content-type automatically.
    const token = getToken();
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(`${API_URL}/admin/models3d/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  },
  deleteModel3D(id: string) {
    return request(`/admin/models3d/${id}`, {
      method: 'DELETE',
    });
  },
};
