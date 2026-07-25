// --- Types ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'barista';
}

export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  category: string | null;
  categoryId: number | null;
  image: string;
  badge: string | null;
  isBestSeller: boolean;
  isAvailable: boolean;
  promotionId: number | null;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number | null;
}

export interface Promotion {
  id: number;
  catalogItemId: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  orderId: string | null;
  createdAt: string;
}

export interface GalleryItem {
  id: number;
  url: string;
  caption: string | null;
  createdAt: string;
}

export interface EventItem {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
  isVisible: boolean;
  createdAt: string;
}

export interface StoreStatus {
  id?: number;
  isOpen: boolean;
  announcementBanner: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  source: 'online' | 'pos';
  status: 'pending_payment' | 'verifying' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerName: string | null;
  orderType: 'dine_in' | 'takeaway';
  tableNumber: string | null;
  subtotal: number;
  discountTotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string | null;
  amountPaid: number | null;
  changeGiven: number | null;
  paymentProofUrl: string | null;
  createdAt: string;
}

export interface OrderDetail extends Order {
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: number;
  catalogItemId: number | null;
  quantity: number;
  unitPrice: number;
  iceLevel: string | null;
  sugarLevel: string | null;
  milkType: string | null;
  itemName: string | null;
  itemImage: string | null;
}

// --- API Client ---

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// --- Auth ---

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      apiFetch<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
    me: () =>
      apiFetch<{ user: User | null }>('/api/auth/me'),
  },

  // --- Catalog ---
  catalog: {
    list: () => apiFetch<CatalogItem[]>('/api/catalog'),
    create: (data: Partial<CatalogItem>) =>
      apiFetch('/api/admin/catalog', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<CatalogItem>) =>
      apiFetch(`/api/admin/catalog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      apiFetch(`/api/admin/catalog/${id}`, { method: 'DELETE' }),
  },

  // --- Promotions ---
  promotions: {
    list: () => apiFetch<Promotion[]>('/api/admin/promotions'),
    upsert: (data: { catalogItemId: number; discountType: string; discountValue: number }) =>
      apiFetch('/api/admin/promotions', { method: 'POST', body: JSON.stringify(data) }),
    delete: (catalogItemId: number) =>
      apiFetch(`/api/admin/promotions/${catalogItemId}`, { method: 'DELETE' }),
  },

  // --- Orders ---
  orders: {
    create: (data: {
      source: 'online' | 'pos';
      items: Array<{
        catalogItemId: number;
        quantity: number;
        iceLevel?: string;
        sugarLevel?: string;
        milkType?: string;
      }>;
      paymentMethod?: string;
      customerName?: string;
      orderType?: string;
      tableNumber?: string;
      amountPaid?: number;
      paymentProofUrl?: string;
    }) => apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    list: (params?: { date?: string; source?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.date) searchParams.set('date', params.date);
      if (params?.source) searchParams.set('source', params.source);
      const qs = searchParams.toString();
      return apiFetch<Order[]>(`/api/orders${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => apiFetch<OrderDetail>(`/api/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // --- Reviews ---
  reviews: {
    listPublic: () => apiFetch<Review[]>('/api/reviews'),
    create: (data: { author: string; rating: number; comment: string; orderId?: string }) =>
      apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
    listAll: () => apiFetch<Review[]>('/api/admin/reviews'),
    toggleVisibility: (id: number, isVisible: boolean) =>
      apiFetch(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ isVisible }) }),
    delete: (id: number) =>
      apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
  },

  // --- Gallery ---
  gallery: {
    list: () => apiFetch<GalleryItem[]>('/api/gallery'),
    create: (data: { url: string; caption?: string }) =>
      apiFetch('/api/admin/gallery', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) =>
      apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' }),
  },

  // --- Events ---
  events: {
    listPublic: () => apiFetch<EventItem[]>('/api/events'),
    create: (data: Partial<EventItem>) =>
      apiFetch('/api/admin/events', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<EventItem>) =>
      apiFetch(`/api/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      apiFetch(`/api/admin/events/${id}`, { method: 'DELETE' }),
  },

  // --- Store ---
  store: {
    getStatus: () => apiFetch<StoreStatus>('/api/store/status'),
    setStatus: (data: { isOpen?: boolean; announcementBanner?: string }) =>
      apiFetch('/api/store/status', { method: 'PATCH', body: JSON.stringify(data) }),
  },
};
