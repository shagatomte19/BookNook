/**
 * Supabase Data Service - Direct database operations
 * 
 * This service handles all CRUD operations using Supabase directly,
 * replacing the need for backend API calls for basic data operations.
 */

import { supabase } from './supabase';

// ============================================
// Types matching the Supabase schema
// ============================================

export interface Profile {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    is_admin: boolean;
    is_active: boolean;
    joined_date?: string;
    age?: number;
    nickname?: string;
    profile_completed: boolean;
    following: string[];
    followers: string[];
    created_at?: string;
    updated_at?: string;
}

export interface Author {
    id: string;
    name: string;
    image_url?: string;
    bio?: string;
    born?: string;
    died?: string;
    top_book_ids: string[];
    created_at?: string;
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
    created_at?: string;
    price_options?: PriceOption[];
}

export interface PriceOption {
    id: string;
    book_id: string;
    vendor: string;
    price: number;
    url?: string;
    in_stock: boolean;
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
    author_id?: string;
    date?: string;
    image_url?: string;
    tags: string[];
    is_approved: number;
    created_at?: string;
}

export interface Comment {
    id: string;
    user_id: string;
    post_id: string;
    content: string;
    created_at?: string;
    updated_at?: string;
    // Joined fields
    user_name?: string;
    user_avatar?: string;
}

export interface Like {
    id: string;
    user_id: string;
    post_id: string;
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

export interface Shelf {
    id: string;
    user_id: string;
    name: string;
    type: 'want_to_read' | 'currently_reading' | 'read' | 'custom';
    is_public: boolean;
    created_at?: string;
    items?: ShelfItem[];
}

export interface ShelfItem {
    id: string;
    shelf_id: string;
    book_id: string;
    added_at?: string;
    book?: Book;
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

// ============================================
// PROFILES (Users)
// ============================================

export const profilesApi = {
    getAll: async (params?: { skip?: number; limit?: number }): Promise<Profile[]> => {
        let query = supabase.from('profiles').select('*');

        if (params?.skip) query = query.range(params.skip, params.skip + (params.limit || 100) - 1);
        if (params?.limit && !params?.skip) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getById: async (userId: string): Promise<Profile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    update: async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    follow: async (currentUserId: string, targetUserId: string): Promise<void> => {
        // Get current user's following list
        const { data: currentUser } = await supabase
            .from('profiles')
            .select('following')
            .eq('id', currentUserId)
            .single();

        // Get target user's followers list
        const { data: targetUser } = await supabase
            .from('profiles')
            .select('followers')
            .eq('id', targetUserId)
            .single();

        if (!currentUser || !targetUser) throw new Error('User not found');

        const newFollowing = [...(currentUser.following || []), targetUserId];
        const newFollowers = [...(targetUser.followers || []), currentUserId];

        await Promise.all([
            supabase.from('profiles').update({ following: newFollowing }).eq('id', currentUserId),
            supabase.from('profiles').update({ followers: newFollowers }).eq('id', targetUserId),
        ]);
    },

    unfollow: async (currentUserId: string, targetUserId: string): Promise<void> => {
        const { data: currentUser } = await supabase
            .from('profiles')
            .select('following')
            .eq('id', currentUserId)
            .single();

        const { data: targetUser } = await supabase
            .from('profiles')
            .select('followers')
            .eq('id', targetUserId)
            .single();

        if (!currentUser || !targetUser) throw new Error('User not found');

        const newFollowing = (currentUser.following || []).filter((id: string) => id !== targetUserId);
        const newFollowers = (targetUser.followers || []).filter((id: string) => id !== currentUserId);

        await Promise.all([
            supabase.from('profiles').update({ following: newFollowing }).eq('id', currentUserId),
            supabase.from('profiles').update({ followers: newFollowers }).eq('id', targetUserId),
        ]);
    },
};

// ============================================
// AUTHORS
// ============================================

export const authorsApi = {
    getAll: async (params?: { skip?: number; limit?: number }): Promise<Author[]> => {
        let query = supabase.from('authors').select('*');

        if (params?.skip) query = query.range(params.skip, params.skip + (params.limit || 100) - 1);
        if (params?.limit && !params?.skip) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getById: async (authorId: string): Promise<Author | null> => {
        const { data, error } = await supabase
            .from('authors')
            .select('*')
            .eq('id', authorId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    create: async (author: Omit<Author, 'id' | 'created_at'>): Promise<Author> => {
        const { data, error } = await supabase
            .from('authors')
            .insert(author)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    update: async (authorId: string, updates: Partial<Author>): Promise<Author> => {
        const { data, error } = await supabase
            .from('authors')
            .update(updates)
            .eq('id', authorId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (authorId: string): Promise<void> => {
        const { error } = await supabase
            .from('authors')
            .delete()
            .eq('id', authorId);

        if (error) throw error;
    },
};

// ============================================
// BOOKS
// ============================================

export const booksApi = {
    getAll: async (params?: { skip?: number; limit?: number; search?: string; genre?: string }): Promise<Book[]> => {
        let query = supabase.from('books').select('*, price_options(*)');

        if (params?.search) {
            query = query.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%`);
        }
        if (params?.genre) {
            query = query.contains('genres', [params.genre]);
        }
        if (params?.skip) query = query.range(params.skip, params.skip + (params.limit || 100) - 1);
        if (params?.limit && !params?.skip) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getById: async (bookId: string): Promise<Book | null> => {
        const { data, error } = await supabase
            .from('books')
            .select('*, price_options(*)')
            .eq('id', bookId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    create: async (book: Omit<Book, 'id' | 'created_at'>): Promise<Book> => {
        const { price_options, ...bookData } = book;

        const { data, error } = await supabase
            .from('books')
            .insert(bookData)
            .select()
            .single();

        if (error) throw error;

        // Insert price options if provided
        if (price_options && price_options.length > 0) {
            const priceOptionsWithBookId = price_options.map(po => ({
                ...po,
                book_id: data.id,
            }));
            await supabase.from('price_options').insert(priceOptionsWithBookId);
        }

        return { ...data, price_options: price_options || [] };
    },

    update: async (bookId: string, updates: Partial<Book>): Promise<Book> => {
        const { price_options, ...bookData } = updates;

        const { data, error } = await supabase
            .from('books')
            .update(bookData)
            .eq('id', bookId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (bookId: string): Promise<void> => {
        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', bookId);

        if (error) throw error;
    },
};

// ============================================
// REVIEWS
// ============================================

export const reviewsApi = {
    getAll: async (params?: { skip?: number; limit?: number; book_id?: string; user_id?: string }): Promise<Review[]> => {
        let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

        if (params?.book_id) query = query.eq('book_id', params.book_id);
        if (params?.user_id) query = query.eq('user_id', params.user_id);
        if (params?.skip) query = query.range(params.skip, params.skip + (params.limit || 100) - 1);
        if (params?.limit && !params?.skip) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getByBook: async (bookId: string): Promise<Review[]> => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('book_id', bookId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    create: async (review: { book_id: string; rating: number; content?: string }, userId: string, userName: string): Promise<Review> => {
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                ...review,
                user_id: userId,
                user_name: userName,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (reviewId: string): Promise<void> => {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) throw error;
    },
};

// ============================================
// POSTS
// ============================================

export const postsApi = {
    getAll: async (params?: { skip?: number; limit?: number; post_type?: string }): Promise<Post[]> => {
        let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

        if (params?.post_type) query = query.eq('type', params.post_type);
        if (params?.skip) query = query.range(params.skip, params.skip + (params.limit || 100) - 1);
        if (params?.limit && !params?.skip) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getById: async (postId: string): Promise<Post | null> => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    create: async (post: Omit<Post, 'id' | 'created_at' | 'is_approved'>, userId: string, authorName: string): Promise<Post> => {
        const { data, error } = await supabase
            .from('posts')
            .insert({
                ...post,
                author: authorName,
                author_id: userId,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    update: async (postId: string, updates: Partial<Post>): Promise<Post> => {
        const { data, error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', postId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (postId: string): Promise<void> => {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;
    },
};

// ============================================
// COMMENTS
// ============================================

export const commentsApi = {
    getByPost: async (postId: string): Promise<Comment[]> => {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles:user_id(name, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Map joined profile data
        return (data || []).map((c: any) => ({
            ...c,
            user_name: c.profiles?.name,
            user_avatar: c.profiles?.avatar_url,
            profiles: undefined,
        }));
    },

    create: async (postId: string, content: string, userId: string): Promise<Comment> => {
        const { data, error } = await supabase
            .from('comments')
            .insert({ post_id: postId, content, user_id: userId })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (commentId: string): Promise<void> => {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;
    },
};

// ============================================
// LIKES
// ============================================

export const likesApi = {
    getByPost: async (postId: string): Promise<Like[]> => {
        const { data, error } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId);

        if (error) throw error;
        return data || [];
    },

    toggle: async (postId: string, userId: string): Promise<{ liked: boolean }> => {
        // Check if like exists
        const { data: existing } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Unlike
            await supabase.from('likes').delete().eq('id', existing.id);
            return { liked: false };
        } else {
            // Like
            await supabase.from('likes').insert({ post_id: postId, user_id: userId });
            return { liked: true };
        }
    },
};

// ============================================
// GROUPS
// ============================================

export const groupsApi = {
    getAll: async (params?: { skip?: number; limit?: number }): Promise<Group[]> => {
        let query = supabase.from('groups').select('*');

        if (params?.skip) query = query.range(params.skip, params.skip + (params.limit || 100) - 1);
        if (params?.limit && !params?.skip) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getById: async (groupId: string): Promise<Group | null> => {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    create: async (group: { name: string; description?: string; image_url?: string; tags?: string[] }, adminId: string): Promise<Group> => {
        const { data, error } = await supabase
            .from('groups')
            .insert({
                ...group,
                admin_id: adminId,
                members: [adminId],
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    join: async (groupId: string, userId: string): Promise<void> => {
        const { data: group } = await supabase
            .from('groups')
            .select('pending_members')
            .eq('id', groupId)
            .single();

        if (!group) throw new Error('Group not found');

        const newPending = [...(group.pending_members || []), userId];
        await supabase.from('groups').update({ pending_members: newPending }).eq('id', groupId);
    },

    acceptMember: async (groupId: string, userId: string): Promise<void> => {
        const { data: group } = await supabase
            .from('groups')
            .select('members, pending_members')
            .eq('id', groupId)
            .single();

        if (!group) throw new Error('Group not found');

        const newMembers = [...(group.members || []), userId];
        const newPending = (group.pending_members || []).filter((id: string) => id !== userId);

        await supabase.from('groups').update({
            members: newMembers,
            pending_members: newPending
        }).eq('id', groupId);
    },

    rejectMember: async (groupId: string, userId: string): Promise<void> => {
        const { data: group } = await supabase
            .from('groups')
            .select('pending_members')
            .eq('id', groupId)
            .single();

        if (!group) throw new Error('Group not found');

        const newPending = (group.pending_members || []).filter((id: string) => id !== userId);
        await supabase.from('groups').update({ pending_members: newPending }).eq('id', groupId);
    },

    getPosts: async (groupId: string): Promise<GroupPost[]> => {
        const { data, error } = await supabase
            .from('group_posts')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createPost: async (groupId: string, content: string, userId: string, userName: string, userAvatar?: string): Promise<GroupPost> => {
        const { data, error } = await supabase
            .from('group_posts')
            .insert({
                group_id: groupId,
                user_id: userId,
                user_name: userName,
                user_avatar: userAvatar,
                content,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

// ============================================
// SHELVES
// ============================================

export const shelvesApi = {
    getUserShelves: async (userId: string): Promise<Shelf[]> => {
        const { data, error } = await supabase
            .from('shelves')
            .select('*, items:shelf_items(*, book:books(*))')
            .eq('user_id', userId);

        if (error) throw error;
        return data || [];
    },

    getShelfByType: async (userId: string, type: string): Promise<Shelf | null> => {
        const { data, error } = await supabase
            .from('shelves')
            .select('*, items:shelf_items(*, book:books(*))')
            .eq('user_id', userId)
            .eq('type', type)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    create: async (name: string, userId: string, isPublic: boolean = true): Promise<Shelf> => {
        const { data, error } = await supabase
            .from('shelves')
            .insert({ name, user_id: userId, is_public: isPublic, type: 'custom' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    addBook: async (shelfId: string, bookId: string): Promise<ShelfItem> => {
        const { data, error } = await supabase
            .from('shelf_items')
            .insert({ shelf_id: shelfId, book_id: bookId })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    removeBook: async (shelfId: string, bookId: string): Promise<void> => {
        const { error } = await supabase
            .from('shelf_items')
            .delete()
            .eq('shelf_id', shelfId)
            .eq('book_id', bookId);

        if (error) throw error;
    },

    getBookStatus: async (userId: string, bookId: string): Promise<string | null> => {
        // First get user's reading status shelves
        const { data: shelves } = await supabase
            .from('shelves')
            .select('id, type')
            .eq('user_id', userId)
            .in('type', ['want_to_read', 'currently_reading', 'read']);

        if (!shelves || shelves.length === 0) return null;

        const shelfIds = shelves.map(s => s.id);

        // Check if book is in any of these shelves
        const { data: items } = await supabase
            .from('shelf_items')
            .select('shelf_id')
            .eq('book_id', bookId)
            .in('shelf_id', shelfIds);

        if (items && items.length > 0) {
            const shelf = shelves.find(s => s.id === items[0].shelf_id);
            return shelf?.type || null;
        }
        return null;
    },
};

// ============================================
// AUDIT LOGS (Admin)
// ============================================

export const auditLogsApi = {
    getAll: async (params?: { skip?: number; limit?: number; action?: string; resource_type?: string }): Promise<AuditLog[]> => {
        let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });

        if (params?.action) query = query.eq('action', params.action);
        if (params?.resource_type) query = query.eq('resource_type', params.resource_type);
        if (params?.skip) query = query.range(params.skip, params.skip + (params.limit || 100) - 1);
        if (params?.limit && !params?.skip) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    create: async (log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> => {
        await supabase.from('audit_logs').insert(log);
    },
};

// ============================================
// DASHBOARD STATS (Admin)
// ============================================

export const adminApi = {
    getDashboardStats: async () => {
        const [
            { count: totalBooks },
            { count: totalAuthors },
            { count: totalUsers },
            { count: totalReviews },
            { count: totalPosts },
            { count: totalGroups },
            { count: pendingReviews },
            { count: pendingPosts },
        ] = await Promise.all([
            supabase.from('books').select('*', { count: 'exact', head: true }),
            supabase.from('authors').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('reviews').select('*', { count: 'exact', head: true }),
            supabase.from('posts').select('*', { count: 'exact', head: true }),
            supabase.from('groups').select('*', { count: 'exact', head: true }),
            supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', 0),
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_approved', 0),
        ]);

        // Get average rating
        const { data: reviews } = await supabase.from('reviews').select('rating');
        const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return {
            total_books: totalBooks || 0,
            total_authors: totalAuthors || 0,
            total_users: totalUsers || 0,
            total_reviews: totalReviews || 0,
            total_posts: totalPosts || 0,
            total_groups: totalGroups || 0,
            average_rating: Math.round(avgRating * 10) / 10,
            pending_reviews: pendingReviews || 0,
            pending_posts: pendingPosts || 0,
            active_users: totalUsers || 0,
        };
    },

    approveContent: async (type: 'review' | 'post', id: string): Promise<void> => {
        const table = type === 'review' ? 'reviews' : 'posts';
        await supabase.from(table).update({ is_approved: 1 }).eq('id', id);
    },

    rejectContent: async (type: 'review' | 'post', id: string): Promise<void> => {
        const table = type === 'review' ? 'reviews' : 'posts';
        await supabase.from(table).update({ is_approved: -1 }).eq('id', id);
    },

    getPendingContent: async () => {
        const [{ data: reviews }, { data: posts }] = await Promise.all([
            supabase.from('reviews').select('*').eq('is_approved', 0),
            supabase.from('posts').select('*').eq('is_approved', 0),
        ]);

        const items = [
            ...(reviews || []).map(r => ({
                id: r.id,
                type: 'review' as const,
                content: r.content,
                author_name: r.user_name,
                created_at: r.created_at,
                status: r.is_approved,
            })),
            ...(posts || []).map(p => ({
                id: p.id,
                type: 'post' as const,
                title: p.title,
                content: p.content,
                author_name: p.author,
                created_at: p.created_at,
                status: p.is_approved,
            })),
        ];

        return items;
    },
};

// Default export
export default {
    profiles: profilesApi,
    authors: authorsApi,
    books: booksApi,
    reviews: reviewsApi,
    posts: postsApi,
    comments: commentsApi,
    likes: likesApi,
    groups: groupsApi,
    shelves: shelvesApi,
    auditLogs: auditLogsApi,
    admin: adminApi,
};
