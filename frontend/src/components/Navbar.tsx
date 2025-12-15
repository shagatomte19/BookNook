import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User as UserIcon, MessageCircle, Sparkles, LogOut, Sun, Moon, Monitor, Settings, ChevronDown, Feather } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Theme } from '../types';

const Navbar: React.FC = () => {
  const { user, logout, theme, setTheme, messages } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="font-serif text-2xl font-bold text-gray-900 tracking-tight">BookNook</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-gray-500 hover:text-gray-900 font-sans text-sm font-medium transition-colors">
                  Feed
                </Link>

                <Link to="/search" className="text-gray-500 hover:text-gray-900 font-sans text-sm font-medium transition-colors">
                  Explore
                </Link>

                <Link to="/authors" className="text-gray-500 hover:text-gray-900 font-sans text-sm font-medium transition-colors flex items-center gap-1">
                  <Feather size={14} />
                  Authors
                </Link>

                <Link to="/groups" className="text-gray-500 hover:text-gray-900 font-sans text-sm font-medium transition-colors">
                  Groups
                </Link>

                <Link to="/recommendations" className="text-gray-500 hover:text-gray-900 font-sans text-sm font-medium transition-colors flex items-center gap-1">
                  <Sparkles size={14} className="text-brand-500" />
                  AI Picks
                </Link>

                <button onClick={cycleTheme} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <ThemeIcon />
                </button>

                <div className="h-4 w-px bg-gray-200"></div>

                <div className="flex items-center gap-4">
                  <Link to="/messages" className="text-gray-400 hover:text-gray-900 relative">
                    <MessageCircle size={20} className="stroke-[1.5]" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-600 rounded-full"></span>}
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-100 group-hover:border-gray-300 transition-colors">
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">{user.nickname || user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.bio || 'BookNook Member'}</p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <UserIcon size={16} />
                          View Profile
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>

                        <div className="my-2 border-t border-gray-100"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
                <Link to="/register" className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
