import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useApp } from '../context/AppContext';

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setUser } = useApp();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Check if we have tokens in the URL hash
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                console.log('🔍 Auth callback - has tokens:', !!accessToken);

                if (accessToken && refreshToken) {
                    // Set the session with the tokens from URL
                    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        console.error('Session error:', sessionError);
                        setError(sessionError.message);
                        setTimeout(() => navigate('/login'), 2000);
                        return;
                    }

                    if (sessionData.session) {
                        const supabaseUser = sessionData.session.user;

                        // Create user object
                        const user = {
                            id: supabaseUser.id,
                            email: supabaseUser.email || '',
                            name: supabaseUser.user_metadata?.full_name ||
                                supabaseUser.user_metadata?.name ||
                                supabaseUser.email?.split('@')[0] || 'User',
                            avatarUrl: supabaseUser.user_metadata?.avatar_url ||
                                supabaseUser.user_metadata?.picture ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.email || 'User')}&background=random`,
                            bio: 'BookNook member',
                            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                            isAdmin: false,
                            following: [],
                            followers: [],
                        };

                        setUser(user);
                        localStorage.setItem('booknook_user', JSON.stringify(user));
                        localStorage.setItem('supabase_session', JSON.stringify(sessionData.session));

                        console.log('✅ Auth successful:', user);

                        // Clear the hash from URL and redirect
                        window.history.replaceState(null, '', '/');
                        navigate('/', { replace: true });
                    }
                } else {
                    // No tokens in URL, try getting existing session
                    const { data, error } = await supabase.auth.getSession();

                    if (error || !data.session) {
                        console.error('No session found');
                        navigate('/login');
                        return;
                    }

                    // Handle existing session (same as above)
                    const supabaseUser = data.session.user;
                    const user = {
                        id: supabaseUser.id,
                        email: supabaseUser.email || '',
                        name: supabaseUser.user_metadata?.full_name ||
                            supabaseUser.user_metadata?.name ||
                            supabaseUser.email?.split('@')[0] || 'User',
                        avatarUrl: supabaseUser.user_metadata?.avatar_url ||
                            supabaseUser.user_metadata?.picture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.email || 'User')}&background=random`,
                        bio: 'BookNook member',
                        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                        isAdmin: false,
                        following: [],
                        followers: [],
                    };

                    setUser(user);
                    localStorage.setItem('booknook_user', JSON.stringify(user));
                    navigate('/');
                }
            } catch (error: any) {
                console.error('Callback error:', error);
                setError(error.message || 'Authentication failed');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleCallback();
    }, [navigate, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                {error ? (
                    <div>
                        <div className="text-red-500 text-xl mb-4">❌</div>
                        <p className="text-lg text-red-600">{error}</p>
                        <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
                    </div>
                ) : (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                        <p className="text-lg">Completing sign in...</p>
                        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
