
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Authentication features may not work.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

const getRedirectUrl = () => {
    if (window.location.hostname !== 'localhost') {
        return `${window.location.origin}/auth/callback`;
    }
    return 'http://localhost:3000/auth/callback';
};

export const supabaseAuth = {
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getRedirectUrl(),
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        return { data, error };
    },
    signInWithFacebook: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: getRedirectUrl(),
            },
        });
        return { data, error };
    },
};
