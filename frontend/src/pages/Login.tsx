
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Github, Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const Login: React.FC = () => {
  const { login, socialLogin, resetPassword, user } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (isForgotPassword) {
      const success = await resetPassword(email);
      if (success) setResetSent(true);
    } else {
      const success = await login(email, password);
      if (success) navigate('/');
    }
    setIsLoading(false);
  };

  const handleSocial = async (provider: 'google') => {
    setIsLoading(true);
    await socialLogin(provider);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-600 rounded-2xl text-white mb-4 shadow-lg shadow-brand-200">
            {isForgotPassword ? <Lock size={32} /> : <BookOpen size={32} />}
          </div>
          <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">
            {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500">
            {isForgotPassword
              ? 'Enter your email to receive a reset link'
              : 'Sign in to continue your reading journey'}
          </p>
        </div>

        {resetSent ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6">
              Check your email for the password reset link.
            </div>
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetSent(false);
              }}
              className="text-brand-600 font-bold hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {!isForgotPassword && (
              <>
                <div className="space-y-4 mb-8">
                  <button
                    onClick={() => handleSocial('google')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 bg-white"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                {!isForgotPassword && (
                  <label className="flex items-center text-gray-600 cursor-pointer">
                    <input type="checkbox" className="mr-2 rounded text-brand-600 focus:ring-brand-500" />
                    Remember me
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(!isForgotPassword)}
                  className="text-brand-600 hover:text-brand-700 font-medium ml-auto"
                >
                  {isForgotPassword ? 'Wait, I remember my password' : 'Forgot password?'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center"
              >
                {isLoading ? <Loader className="animate-spin" /> : (
                  <>
                    {isForgotPassword ? 'Send Reset Link' : 'Sign In'}
                    <ArrowRight className="ml-2" size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <p className="text-center mt-8 text-gray-600">
          Don't have an account? {' '}
          <Link to="/register" className="text-brand-600 font-bold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
