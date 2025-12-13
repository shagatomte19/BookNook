import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, LogOut, Users, Shield, FileText, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useApp();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden lg:block">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-serif font-bold tracking-wide">Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-1">Manage BookNook Content</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/admin/books"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/books') ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Book size={20} />
            <span className="font-medium">Manage Books</span>
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/users') ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-medium">User Management</span>
          </Link>

          <Link
            to="/admin/moderation"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/moderation') ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Shield size={20} />
            <span className="font-medium">Content Moderation</span>
          </Link>

          <Link
            to="/admin/audit-logs"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/audit-logs') ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <FileText size={20} />
            <span className="font-medium">Audit Logs</span>
          </Link>

          <div className="pt-8 mt-8 border-t border-gray-800 space-y-2">
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
              <span>Back to Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 lg:hidden">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">Admin Panel</span>
            <Link to="/" className="text-sm text-brand-600">Back to Site</Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;