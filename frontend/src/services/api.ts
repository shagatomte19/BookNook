/**
 * API Service - Backend API client for BookNook
 * 
 * This module provides typed methods for all API endpoints,
 * handles authentication tokens, and manages error responses.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface ApiError {
  detail: string;
  status: number;
}

export interface PriceOption {
  id?: string;
  vendor: string;
  price: number;
  url?: string;
  in_stock?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  cover_url?: string;
  description?: string;
  published_year?: number;
  genres: string[];
  price_options: PriceOption[];
}

export interface Author {
  id: string;
  name: string;
  image_url?: string;
  bio?: string;
  born?: string;
  died?: string;
  top_book_ids: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  is_admin: boolean;
  is_active: boolean;
  joined_date?: string;
  following: string[];
  followers: string[];
  created_at?: string;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  content?: string;
  date?: string;
  is_approved: number;
  created_at?: string;
}

export interface Post {
  id: string;
  type: 'blog' | 'news' | 'spotlight';
  title: string;
  excerpt?: string;
  content?: string;
  author: string;
  date?: string;
  image_url?: string;
  tags: string[];
  is_approved: number;
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  image_url?: string;
  tags: string[];
  members: string[];
  pending_members: string[];
  created_at?: string;
}

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content?: string;
  date?: string;
  likes: number;
  created_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp?: string;
  read: boolean;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DashboardStats {
  total_books: number;
  total_authors: number;
  total_users: number;
  total_reviews: number;
  total_posts: number;
  total_groups: number;
  average_rating: number;
  pending_reviews: number;
  pending_posts: number;
  active_users: number;
}

export interface ContentModerationItem {
  id: string;
  type: 'review' | 'post';
  title?: string;
  content?: string;
  author_name: string;
  created_at?: string;
  status: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at?: string;
}

// Token management
const TOKEN_KEY = 'booknook_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw { detail: error.detail || 'An error occurred', status: response.status } as ApiError;
  }
  
  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  
  return JSON.parse(text) as T;
}

// ============================================
// Authentication API
// ============================================

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getMe: () => apiRequest<User>('/auth/me'),
  
  logout: () => apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
};

// ============================================
// Users API
// ============================================

export const usersApi = {
  getAll: (params?: { skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return apiRequest<User[]>(`/users?${query}`);
  },
  
  getById: (userId: string) => apiRequest<User>(`/users/${userId}`),
  
  updateMe: (data: Partial<User>) =>
    apiRequest<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  follow: (userId: string) =>
    apiRequest<User>(`/users/${userId}/follow`, { method: 'POST' }),
  
  unfollow: (userId: string) =>
    apiRequest<User>(`/users/${userId}/unfollow`, { method: 'POST' }),
};

// ============================================
// Books API
// ============================================

export const booksApi = {
  getAll: (params?: { skip?: number; limit?: number; search?: string; genre?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.genre) query.set('genre', params.genre);
    return apiRequest<Book[]>(`/books?${query}`);
  },
  
  getById: (bookId: string) => apiRequest<Book>(`/books/${bookId}`),
  
  create: (data: Omit<Book, 'id'>) =>
    apiRequest<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (bookId: string, data: Partial<Book>) =>
    apiRequest<Book>(`/books/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (bookId: string) =>
    apiRequest<{ message: string }>(`/books/${bookId}`, { method: 'DELETE' }),
};

// ============================================
// Authors API
// ============================================

export const authorsApi = {
  getAll: (params?: { skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return apiRequest<Author[]>(`/authors?${query}`);
  },
  
  getById: (authorId: string) => apiRequest<Author>(`/authors/${authorId}`),
  
  create: (data: Omit<Author, 'id'>) =>
    apiRequest<Author>('/authors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (authorId: string, data: Partial<Author>) =>
    apiRequest<Author>(`/authors/${authorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (authorId: string) =>
    apiRequest<{ message: string }>(`/authors/${authorId}`, { method: 'DELETE' }),
};

// ============================================
// Reviews API
// ============================================

export const reviewsApi = {
  getAll: (params?: { skip?: number; limit?: number; book_id?: string; user_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.book_id) query.set('book_id', params.book_id);
    if (params?.user_id) query.set('user_id', params.user_id);
    return apiRequest<Review[]>(`/reviews?${query}`);
  },
  
  getByBook: (bookId: string) => apiRequest<Review[]>(`/reviews/book/${bookId}`),
  
  getByUser: (userId: string) => apiRequest<Review[]>(`/reviews/user/${userId}`),
  
  create: (data: { book_id: string; rating: number; content?: string }) =>
    apiRequest<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (reviewId: string, data: Partial<Review>) =>
    apiRequest<Review>(`/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (reviewId: string) =>
    apiRequest<{ message: string }>(`/reviews/${reviewId}`, { method: 'DELETE' }),
};

// ============================================
// Posts API
// ============================================

export const postsApi = {
  getAll: (params?: { skip?: number; limit?: number; post_type?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.post_type) query.set('post_type', params.post_type);
    return apiRequest<Post[]>(`/posts?${query}`);
  },
  
  getById: (postId: string) => apiRequest<Post>(`/posts/${postId}`),
  
  create: (data: Omit<Post, 'id' | 'author' | 'date' | 'is_approved' | 'created_at'>) =>
    apiRequest<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (postId: string, data: Partial<Post>) =>
    apiRequest<Post>(`/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (postId: string) =>
    apiRequest<{ message: string }>(`/posts/${postId}`, { method: 'DELETE' }),
};

// ============================================
// Groups API
// ============================================

export const groupsApi = {
  getAll: (params?: { skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return apiRequest<Group[]>(`/groups?${query}`);
  },
  
  getById: (groupId: string) => apiRequest<Group>(`/groups/${groupId}`),
  
  create: (data: { name: string; description?: string; image_url?: string; tags?: string[] }) =>
    apiRequest<Group>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  join: (groupId: string) =>
    apiRequest<{ message: string }>(`/groups/${groupId}/join`, { method: 'POST' }),
  
  acceptMember: (groupId: string, userId: string) =>
    apiRequest<{ message: string }>(`/groups/${groupId}/accept/${userId}`, { method: 'POST' }),
  
  rejectMember: (groupId: string, userId: string) =>
    apiRequest<{ message: string }>(`/groups/${groupId}/reject/${userId}`, { method: 'POST' }),
  
  getPosts: (groupId: string) => apiRequest<GroupPost[]>(`/groups/${groupId}/posts`),
  
  createPost: (groupId: string, content: string) =>
    apiRequest<GroupPost>(`/groups/${groupId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ group_id: groupId, content }),
    }),
};

// ============================================
// Messages API
// ============================================

export const messagesApi = {
  getAll: () => apiRequest<Message[]>('/messages'),
  
  getConversation: (userId: string) => apiRequest<Message[]>(`/messages/conversation/${userId}`),
  
  send: (receiverId: string, content: string) =>
    apiRequest<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content }),
    }),
  
  markRead: (senderId: string) =>
    apiRequest<{ message: string }>(`/messages/read/${senderId}`, { method: 'POST' }),
};

// ============================================
// Admin API
// ============================================

export const adminApi = {
  getDashboardStats: () => apiRequest<DashboardStats>('/admin/dashboard/stats'),
  
  getUsers: (params?: { skip?: number; limit?: number; search?: string; is_admin?: boolean; is_active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.is_admin !== undefined) query.set('is_admin', params.is_admin.toString());
    if (params?.is_active !== undefined) query.set('is_active', params.is_active.toString());
    return apiRequest<User[]>(`/admin/users?${query}`);
  },
  
  updateUser: (userId: string, data: Partial<User>) =>
    apiRequest<User>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  deleteUser: (userId: string) =>
    apiRequest<{ message: string }>(`/admin/users/${userId}`, { method: 'DELETE' }),
  
  toggleAdmin: (userId: string) =>
    apiRequest<User>(`/admin/users/${userId}/toggle-admin`, { method: 'POST' }),
  
  toggleActive: (userId: string) =>
    apiRequest<User>(`/admin/users/${userId}/toggle-active`, { method: 'POST' }),
  
  getPendingContent: () => apiRequest<ContentModerationItem[]>('/admin/content/pending'),
  
  approveContent: (type: 'review' | 'post', id: string) =>
    apiRequest<{ message: string }>(`/admin/content/${type}/${id}/approve`, { method: 'POST' }),
  
  rejectContent: (type: 'review' | 'post', id: string) =>
    apiRequest<{ message: string }>(`/admin/content/${type}/${id}/reject`, { method: 'POST' }),
  
  getAuditLogs: (params?: { skip?: number; limit?: number; action?: string; resource_type?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', params.skip.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.action) query.set('action', params.action);
    if (params?.resource_type) query.set('resource_type', params.resource_type);
    return apiRequest<AuditLog[]>(`/admin/audit-logs?${query}`);
  },
};

// Default export with all APIs
export default {
  auth: authApi,
  users: usersApi,
  books: booksApi,
  authors: authorsApi,
  reviews: reviewsApi,
  posts: postsApi,
  groups: groupsApi,
  messages: messagesApi,
  admin: adminApi,
};
