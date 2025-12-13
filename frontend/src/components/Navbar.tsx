
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, User as UserIcon, Home, Compass, Users, LayoutDashboard, MessageCircle, Sparkles, LogOut, LogIn, Sun, Moon, Monitor, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Theme } from '../types';

const Navbar: React.FC = () => {
  const { user, logout, theme, setTheme, messages } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => `flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive(path) ? 'text-brand-700 bg-brand-50 shadow-sm' : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
  }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'gray'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const unreadCount = user ? messages.filter(m => m.receiverId === user.id && !m.read).length : 0;

  const ThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} />;
      case 'dark': return <Moon size={18} />;
      case 'gray': return <Monitor size={18} />; 
      default: return <Sun size={18} />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-brand-100 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-brand-600 text-white p-2 rounded-xl group-hover:bg-brand-700 transition-colors shadow-sm">
              <BookOpen size={24} />
            </div>
            <span className="font-serif text-xl font-bold text-gray-900 tracking-tight">BookNook</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 overflow-x-auto no-scrollbar">
                <Link to="/" className={linkClass('/')}>
                  <Home size={18} />
                  <span className="hidden lg:inline">Feed</span>
                </Link>

                <Link to="/search" className={linkClass('/search')}>
                  <Compass size={18} />
                  <span className="hidden lg:inline">Explore</span>
                </Link>

                <Link to="/messages" className={`${linkClass('/messages')} relative`}>
                  <Mail size={18} />
                  <span className="hidden lg:inline">Messages</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                  )}
                </Link>

                <Link to="/recommendations" className={linkClass('/recommendations')}>
                  <Sparkles size={18} className={isActive('/recommendations') ? 'text-brand-600 fill-brand-100' : ''} />
                  <span className="hidden lg:inline">AI Picks</span>
                </Link>

                <Link to="/groups" className={linkClass('/groups')}>
                  <MessageCircle size={18} />
                  <span className="hidden lg:inline">Groups</span>
                </Link>

                <Link to="/authors" className={linkClass('/authors')}>
                  <Users size={18} />
                  <span className="hidden lg:inline">Authors</span>
                </Link>

                {user.isAdmin && (
                  <>
                    <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                    <Link to="/admin" className={linkClass('/admin')}>
                      <LayoutDashboard size={18} />
                      <span className="hidden lg:inline">Admin</span>
                    </Link>
                  </>
                )}
                
                <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                
                <div className="flex items-center gap-2">
                  <Link 
                    to="/profile" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive('/profile') ? 'ring-2 ring-brand-100' : 'hover:ring-2 hover:ring-gray-100'
                    }`}
                  >
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                    <span className="hidden md:inline text-gray-700 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                 <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-700">Log In</Link>
                 <Link to="/register" className="px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 shadow-sm transition-colors">Sign Up</Link>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
