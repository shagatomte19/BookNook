
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Review, User, Author, Post, Publisher, Group, GroupPost, Theme, DirectMessage } from '../types';
import api, { authApi, usersApi, booksApi, authorsApi, reviewsApi, postsApi, groupsApi, messagesApi, adminApi, getToken, setToken, removeToken, getAdminToken, setAdminToken, removeAdminToken, adminAuthApi } from '../services/api';
import { INITIAL_REVIEWS, CURRENT_USER } from '../constants';

// Mock Initial Groups
const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Sci-Fi Enthusiasts',
    description: 'A place to discuss time travel, space operas, and the future of humanity.',
    adminId: 'u1',
    members: ['u1', 'u2', 'u3'],
    pendingMembers: [],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    tags: ['Sci-Fi', 'Future', 'Tech']
  },
  {
    id: 'g2',
    name: 'Classic Literature Club',
    description: 'Revisiting the classics from Austen to Dickens.',
    adminId: 'u2',
    members: ['u2', 'u3'],
    pendingMembers: ['u1'],
    imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=80',
    tags: ['Classics', 'History', 'Literature']
  },
];

const INITIAL_GROUP_POSTS: GroupPost[] = [
  {
    id: 'gp1',
    groupId: 'g1',
    userId: 'u2',
    userName: 'John Doe',
    userAvatar: 'https://i.pravatar.cc/150?u=u2',
    content: 'Has anyone read the latest Aris Thorne book? The ending blew my mind!',
    date: '2 hours ago',
    likes: 5
  }
];

// Mock Users Data to support social features
const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u_sarah',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    bio: 'Editor turned author. Cozy mystery enthusiast.',
    joinedDate: 'Mar 2022',
    isAdmin: false,
    following: [],
    followers: ['u1']
  },
  {
    id: 'u_editorial',
    name: 'BookNook Editorial',
    avatarUrl: 'https://ui-avatars.com/api/?name=BookNook+Editorial&background=138A92&color=fff',
    bio: 'Official updates and curated lists from the BookNook team.',
    joinedDate: 'Jan 2020',
    isAdmin: true,
    following: [],
    followers: []
  },
  {
    id: 'u2',
    name: 'John Doe',
    avatarUrl: 'https://i.pravatar.cc/150?u=u2',
    bio: 'Casual reader.',
    joinedDate: 'Feb 2023',
    isAdmin: false,
    following: [],
    followers: []
  }
];

// Mock Initial Messages
const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: 'm1',
    senderId: 'u_sarah',
    receiverId: 'u1',
    content: 'Hey Alice! Thanks for following. Have you read The Teapot Poisoning yet?',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false
  }
];

interface AppContextType {
  books: Book[];
  reviews: Review[];
  user: User | null;
  allUsers: User[]; // List of all users in the system
  authors: Author[];
  posts: Post[];
  publishers: Publisher[];
  groups: Group[];
  groupPosts: GroupPost[];
  messages: DirectMessage[];
  isLoading: boolean;
  theme: Theme;
  addReview: (review: Review) => void;
  getBookReviews: (bookId: string) => Review[];
  getUserReviews: (userId: string) => Review[];
  getPost: (postId: string) => Post | undefined;
  getUserById: (userId: string) => User | undefined;
  getUserByName: (name: string) => User | undefined;

  // Admin & User Content functions
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  addPost: (post: Post) => void;
  toggleAdmin: () => void;

  // Social Functions
  followUser: (targetUserId: string) => void;
  unfollowUser: (targetUserId: string) => void;
  sendMessage: (receiverId: string, content: string) => void;
  markMessagesRead: (senderId: string) => void;

  // Group functions
  createGroup: (group: Group) => void;
  joinGroup: (groupId: string) => void;
  acceptMember: (groupId: string, userId: string) => void;
  rejectMember: (groupId: string, userId: string) => void;
  addGroupPost: (post: GroupPost) => void;

  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  socialLogin: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;

  // Theme functions
  setTheme: (theme: Theme) => void;

  // Admin Auth
  adminUser: User | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>(INITIAL_GROUP_POSTS);
  const [messages, setMessages] = useState<DirectMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<Theme>('light');

  // Check for saved user session and theme on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('booknook_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedTheme = localStorage.getItem('booknook_theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Check for stored tokens logic
  useEffect(() => {
    const initAuth = async () => {
      // User Token
      const token = getToken();
      if (token && !user) {
        try {
          const userData = await authApi.getMe();
          // Map backend snake_case to frontend camelCase
          const mappedUser = {
            ...userData,
            isAdmin: (userData as any).is_admin || false,
            joinedDate: (userData as any).joined_date || 'N/A',
            avatarUrl: (userData as any).avatar_url
          } as unknown as User;
          setUser(mappedUser);
        } catch (error) {
          removeToken();
        }
      }

      // Admin Token
      const adminToken = getAdminToken();
      if (adminToken && !adminUser) {
        // Validation via stats call as a proxy for specific admin-me endpoint
        try {
          const stats = await adminApi.getDashboardStats();
          if (stats) {
            // Set a placeholder admin user object since we validated the token
            setAdminUser({
              id: 'admin',
              name: 'BookNook Admin',
              email: 'admin@booknook.com',
              isAdmin: true,
              isActive: true,
              joinedDate: 'N/A',
              followers: [],
              following: [],
              bio: 'System Administrator'
            } as unknown as User);
          }
        } catch (error) {
          removeAdminToken();
        }
      }
    };
    initAuth();
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('booknook_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataResponse, postsResponse] = await Promise.all([
          fetch('./data.json'),
          fetch('./posts.json')
        ]);

        if (!dataResponse.ok || !postsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await dataResponse.json();
        const postsData = await postsResponse.json();

        setBooks(data.books || []);
        setAuthors(data.authors || []);
        setPublishers(data.publishers || []);
        setPosts(postsData.posts || []);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync current user with allUsers list
  useEffect(() => {
    if (user) {
      setAllUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) {
          return prev.map(u => u.id === user.id ? user : u);
        }
        return [...prev, user];
      });
    }
  }, [user]);

  // Auth Functions
  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if user exists in mock DB (by fuzzy email logic for demo)
    // For demo, we just reset to CURRENT_USER or create a new one
    // But let's check if we have a mock user for this email logic
    const loggedInUser: User = {
      ...CURRENT_USER,
      name: email.split('@')[0],
      id: `u-${Date.now()}`
    };

    setUser(loggedInUser);
    localStorage.setItem('booknook_user', JSON.stringify(loggedInUser));
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      bio: 'New member of the BookNook community.',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isAdmin: false,
      following: [],
      followers: []
    };

    setUser(newUser);
    localStorage.setItem('booknook_user', JSON.stringify(newUser));
    return true;
  };

  const socialLogin = async (provider: 'google' | 'github') => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const socialUser: User = {
      id: `u-${provider}-${Date.now()}`,
      name: provider === 'google' ? 'Google User' : 'GitHub User',
      avatarUrl: provider === 'google'
        ? 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
        : 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
      bio: `Logged in via ${provider === 'google' ? 'Google' : 'GitHub'}.`,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isAdmin: false,
      following: [],
      followers: []
    };

    setUser(socialUser);
    localStorage.setItem('booknook_user', JSON.stringify(socialUser));
  };

  const logout = () => {
    setUser(null);
    removeToken();
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await adminAuthApi.login({ email, password });
      setAdminToken(response.access_token);

      // Map response user to our internal User type if needed, 
      // or just trust the response.
      // The backend returns UserResponse, which matches our User interface mostly.
      // We need to map `is_admin` to `isAdmin` if the field names differ.
      // Checking keys... Backend: is_admin, Frontend: isAdmin (in MOCK_USERS).
      // But wait! The `api.ts` defines User interface with `is_admin`.
      // The frontend MOCK_USERS uses `isAdmin`. We have a mismatch in frontend types vs backend types!
      // Let's check `types.ts`.
      // Assuming for now we need to map it.
      const backendUser = response.user as any;
      const mappedUser: User = {
        ...backendUser,
        isAdmin: backendUser.is_admin,
        joinedDate: backendUser.joined_date || 'N/A',
        avatarUrl: backendUser.avatar_url
      };

      setAdminUser(mappedUser);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const adminLogout = () => {
    removeAdminToken();
    setAdminUser(null);
    window.location.hash = '/admin/login';
  };


  // Content Actions
  const addReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  const getBookReviews = (bookId: string) => {
    return reviews.filter((r) => r.bookId === bookId);
  };

  const getUserReviews = (userId: string) => {
    return reviews.filter((r) => r.userId === userId);
  };

  const getPost = (postId: string) => {
    return posts.find(p => p.id === postId);
  };

  const getUserById = (userId: string) => {
    return allUsers.find(u => u.id === userId);
  };

  const getUserByName = (name: string) => {
    return allUsers.find(u => u.name === name);
  };

  const addPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  // Admin Actions
  const addBook = (book: Book) => {
    setBooks((prev) => [book, ...prev]);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  };

  const deleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const toggleAdmin = () => {
    if (user) {
      const updatedUser = { ...user, isAdmin: !user.isAdmin };
      setUser(updatedUser);
      localStorage.setItem('booknook_user', JSON.stringify(updatedUser));
    }
  };

  // Group Actions
  const createGroup = (group: Group) => {
    setGroups(prev => [...prev, group]);
  };

  const joinGroup = (groupId: string) => {
    if (!user) return;
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (g.members.includes(user.id) || g.pendingMembers.includes(user.id)) return g;
        return { ...g, pendingMembers: [...g.pendingMembers, user.id] };
      }
      return g;
    }));
  };

  const acceptMember = (groupId: string, userId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          pendingMembers: g.pendingMembers.filter(id => id !== userId),
          members: [...g.members, userId]
        };
      }
      return g;
    }));
  };

  const rejectMember = (groupId: string, userId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          pendingMembers: g.pendingMembers.filter(id => id !== userId)
        };
      }
      return g;
    }));
  };

  const addGroupPost = (post: GroupPost) => {
    setGroupPosts(prev => [post, ...prev]);
  };

  // Social Functions
  const followUser = (targetUserId: string) => {
    if (!user) return;

    // Update local user state
    const updatedUser = { ...user, following: [...user.following, targetUserId] };
    setUser(updatedUser);
    localStorage.setItem('booknook_user', JSON.stringify(updatedUser));

    // Update target user's followers list in allUsers
    setAllUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, followers: [...u.followers, user.id] };
      }
      if (u.id === user.id) {
        return updatedUser;
      }
      return u;
    }));
  };

  const unfollowUser = (targetUserId: string) => {
    if (!user) return;

    // Update local user state
    const updatedUser = { ...user, following: user.following.filter(id => id !== targetUserId) };
    setUser(updatedUser);
    localStorage.setItem('booknook_user', JSON.stringify(updatedUser));

    // Update target user's followers list in allUsers
    setAllUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, followers: u.followers.filter(id => id !== user.id) };
      }
      if (u.id === user.id) {
        return updatedUser;
      }
      return u;
    }));
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!user) return;
    const newMessage: DirectMessage = {
      id: `m${Date.now()}`,
      senderId: user.id,
      receiverId: receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markMessagesRead = (senderId: string) => {
    if (!user) return;
    setMessages(prev => prev.map(m => {
      if (m.senderId === senderId && m.receiverId === user.id && !m.read) {
        return { ...m, read: true };
      }
      return m;
    }));
  };

  return (
    <AppContext.Provider value={{
      books, reviews, user, authors, posts, publishers, groups, groupPosts, allUsers, messages, isLoading, theme,
      addReview, getBookReviews, getUserReviews, getPost, getUserById, getUserByName,
      addBook, updateBook, deleteBook, addPost, toggleAdmin,
      createGroup, joinGroup, acceptMember, rejectMember, addGroupPost,
      followUser, unfollowUser, sendMessage, markMessagesRead,
      login, register, socialLogin, logout, setTheme,

      // Admin
      adminUser, adminLogin, adminLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
