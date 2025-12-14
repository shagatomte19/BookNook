
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Authors from './pages/Authors';
import AuthorDetails from './pages/AuthorDetails';
import BookDetails from './pages/BookDetails';
import PostDetails from './pages/PostDetails';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Dashboard from './pages/admin/Dashboard';
import BookManager from './pages/admin/BookManager';
import UserManager from './pages/admin/UserManager';
import ContentModeration from './pages/admin/ContentModeration';
import AuditLogs from './pages/admin/AuditLogs';
import Recommendations from './pages/Recommendations';
import Login from './pages/Login';
import AdminLogin from './pages/admin/AdminLogin';
import Register from './pages/Register';
import ChatBot from './components/ChatBot';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useApp();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { adminUser, isLoading } = useApp();

  if (isLoading) return null;

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen text-gray-800 font-sans relative">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public/Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Content Routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
              <Route path="/authors" element={<ProtectedRoute><Authors /></ProtectedRoute>} />
              <Route path="/author/:id" element={<ProtectedRoute><AuthorDetails /></ProtectedRoute>} />
              <Route path="/book/:id" element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />
              <Route path="/post/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Social Routes */}
              <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

              {/* Group Routes */}
              <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
              <Route path="/group/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <Dashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <ProtectedAdminRoute>
                    <BookManager />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedAdminRoute>
                    <UserManager />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <ProtectedAdminRoute>
                    <ContentModeration />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedAdminRoute>
                    <AuditLogs />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </main>

          <ChatBot />

          <footer className="bg-white border-t border-gray-200 py-12 text-center">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-serif font-bold text-lg text-gray-900 mb-2">BookNook</p>
              <p className="text-gray-500 text-sm mb-6">Connecting readers, one story at a time.</p>
              <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} BookNook. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
