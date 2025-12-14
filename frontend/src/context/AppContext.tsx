
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Review, User, Author, Post, Publisher, Group, GroupPost, Theme, DirectMessage } from '../types';
import api, { authApi, usersApi, booksApi, authorsApi, reviewsApi, postsApi, groupsApi, messagesApi, adminApi, getToken, setToken, removeToken, getAdminToken, setAdminToken, removeAdminToken, adminAuthApi } from '../services/api';
import { supabase, supabaseAuth } from '../services/supabase';
import { INITIAL_REVIEWS, CURRENT_USER } from '../constants';

// Initial empty states
const INITIAL_GROUPS: Group[] = [];
const INITIAL_GROUP_POSTS: GroupPost[] = [];
const MOCK_USERS: User[] = [CURRENT_USER]; // Keep CURRENT_USER for fallback/dev
const INITIAL_MESSAGES: DirectMessage[] = [];

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
  isAuthLoading: boolean;
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
  socialLogin: (provider: 'google') => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;

  // Theme functions
  setTheme: (theme: Theme) => void;
  setUser: (user: User | null) => void;

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
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
    // Immediate session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) setIsAuthLoading(false);
    });

    // Supabase Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Map Supabase user to App User
        const { user_metadata } = session.user;
        const mappedUser: User = {
          id: session.user.id,
          name: user_metadata.name || user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          avatarUrl: user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || 'U')}&background=random`,
          bio: 'BookNook Member',
          joinedDate: new Date(session.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          isAdmin: false,
          following: [],
          followers: [],
          profileCompleted: false, // Will be updated by backend sync
          // Keep existing extra properties if we have them from backend in future
        };
        setUser(mappedUser);
        setToken(session.access_token);

        // Also try to get backend profile if it exists to overwrite with richer data
        try {
          // We might need to ensure backend user exists here or just rely on shared ID
          // const backendUser = await authApi.getMe();
          // setUser({ ...mappedUser, ...backendUser }); 
        } catch (e) {
          console.log('Backend sync optional', e);
        }

      } else {
        setUser(null);
        removeToken();
      }
      setIsAuthLoading(false);
    });

    // Check for Admin Token separately (keep existing logic or migrate? Keeping simple for now)
    const initAuth = async () => {
      // Admin Token logic remains for separate admin system
      const adminToken = getAdminToken();
      if (adminToken && !adminUser) {
        // Validation via stats call as a proxy for specific admin-me endpoint
        try {
          const stats = await adminApi.getDashboardStats();
          if (stats) {
            setAdminUser({
              id: 'admin',
              name: 'BookNook Admin',
              email: 'admin@booknook.com',
              isAdmin: true,
              followers: [],
              following: [],
              bio: 'System Administrator',
              avatarUrl: '',
              joinedDate: 'N/A'
            } as unknown as User);
          }
        } catch (error) {
          removeAdminToken();
        }
      }
    };
    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('booknook_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch all data in parallel
        const [
          booksData,
          authorsData,
          postsData,
          groupsData,
          usersData,
          reviewsData,
          messagesData
        ] = await Promise.all([
          booksApi.getAll(),
          authorsApi.getAll(),
          postsApi.getAll(),
          groupsApi.getAll(),
          usersApi.getAll(),
          reviewsApi.getAll(),
          getToken() ? messagesApi.getAll() : Promise.resolve([])
        ]);

        // Map Backend Types to Frontend Types

        const mappedBooks: Book[] = booksData.map((b: any) => ({
          ...b,
          coverUrl: b.cover_url,
          publishedYear: b.published_year,
          priceOptions: b.price_options?.map((p: any) => ({
            ...p,
            inStock: p.in_stock
          })) || []
        }));

        const mappedAuthors: Author[] = authorsData.map((a: any) => ({
          ...a,
          imageUrl: a.image_url,
          topBookIds: a.top_book_ids || []
        }));

        const mappedPosts: Post[] = postsData.map((p: any) => ({
          ...p,
          imageUrl: p.image_url
        }));

        const mappedGroups: Group[] = groupsData.map((g: any) => ({
          ...g,
          adminId: g.admin_id,
          imageUrl: g.image_url,
          pendingMembers: g.pending_members || []
        }));

        const mappedUsers: User[] = usersData.map((u: any) => ({
          ...u,
          avatarUrl: u.avatar_url,
          isAdmin: u.is_admin,
          joinedDate: u.joined_date,
          age: u.age,
          nickname: u.nickname,
          profileCompleted: u.profile_completed
        }));

        const mappedReviews: Review[] = reviewsData.map((r: any) => ({
          ...r,
          bookId: r.book_id,
          userId: r.user_id,
          userName: r.user_name
        }));

        const mappedMessages: DirectMessage[] = messagesData.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content,
          timestamp: m.timestamp || m.created_at || new Date().toISOString(),
          read: m.read
        }));

        setBooks(mappedBooks);
        setAuthors(mappedAuthors);
        setPosts(mappedPosts);
        setGroups(mappedGroups);
        setAllUsers(mappedUsers);
        setReviews(mappedReviews);
        setMessages(mappedMessages);

        // Extract unique publishers from books if not fetched separately
        // (Assuming publisher is a string on Book, but we have a Publisher type)
        // For now, we update publishers based on book data if needed, or leave empty.

      } catch (error) {
        console.error("Error loading data from API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]); // Refetch when user changes (e.g. for messages)

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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Login error:', error.message);
      return false;
    }
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) {
      console.error('Registration error:', error.message);
      return false;
    }
    return true;
  };

  const socialLogin = async (provider: 'google') => {
    if (provider === 'google') {
      const { error } = await supabaseAuth.signInWithGoogle();
      if (error) console.error('Social login error:', error.message);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      console.error('Reset password error:', error.message);
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
      books, reviews, user, authors, posts, publishers, groups, groupPosts, allUsers, messages, isLoading, isAuthLoading, theme,
      addReview, getBookReviews, getUserReviews, getPost, getUserById, getUserByName,
      addBook, updateBook, deleteBook, addPost, toggleAdmin,
      createGroup, joinGroup, acceptMember, rejectMember, addGroupPost,
      followUser, unfollowUser, sendMessage, markMessagesRead,
      login, register, socialLogin, resetPassword, logout, setTheme,

      // Admin
      adminUser, adminLogin, adminLogout,
      setUser
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
