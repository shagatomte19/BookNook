import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Handles legacy hash-based routing redirects.
 * If a user navigates to /#/admin, this component catches it 
 * and redirects to the proper PathRouter route /admin.
 */
const HashRedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if there's a hash in the window location
        if (window.location.hash) {
            const hashPath = window.location.hash.replace('#', '');

            // Ignore Supabase auth tokens which are handled by AuthCallback
            if (hashPath.includes('access_token') ||
                hashPath.includes('refresh_token') ||
                hashPath.includes('error_description')) {
                return;
            }

            if (hashPath) {
                // Clear the hash to prevent loops if we were using HashRouter (we aren't, but good practice)
                // and navigate to the path
                // We use replace: true so the back button doesn't take them back to the broken hash URL
                navigate(hashPath, { replace: true });
            }
        }
    }, [navigate, location]); // Re-run if location changes, though mostly needed on mount

    return null;
};

export default HashRedirectHandler;
