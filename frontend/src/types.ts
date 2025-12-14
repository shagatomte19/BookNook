
export type Theme = 'light' | 'dark' | 'gray';

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  content: string;
  date: string;
}

export interface PriceOption {
  vendor: string;
  price: number;
  url: string;
  inStock: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  coverUrl: string;
  description: string;
  publishedYear: number;
  genres: string[];
  priceOptions: PriceOption[];
}

export interface Publisher {
  id: string;
  name: string;
  location: string;
  website: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  joinedDate: string;
  isAdmin?: boolean;
  following: string[]; // Array of User IDs
  followers: string[]; // Array of User IDs
  // Profile Enhancements
  age?: number;
  nickname?: string;
  profileCompleted?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Author {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  born?: string;
  died?: string;
  topBookIds: string[];
}

export interface Post {
  id: string;
  type: 'blog' | 'news' | 'spotlight';
  title: string;
  excerpt: string;
  content: string; // Added full content field
  author: string;
  date: string;
  imageUrl?: string;
  tags: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: string[]; // List of User IDs
  pendingMembers: string[]; // List of User IDs
  imageUrl: string;
  tags: string[];
}

export interface GroupPost {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  date: string;
  likes: number;
}
