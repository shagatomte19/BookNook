import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Loader, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const { adminLogin } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const success = await adminLogin(email, password);
            if (success) {
                navigate('/admin');
            } else {
                setError('Invalid credentials or not an admin account');
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
            <div className="bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-600 rounded-2xl text-white mb-4 shadow-lg shadow-brand-900/50">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl font-serif font-black text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-400">Secure access for BookNook staff</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl flex items-center text-red-200">
                        <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="admin@booknook.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-500 transition-all shadow-lg shadow-brand-900/50 flex items-center justify-center mt-6"
                    >
                        {isLoading ? <Loader className="animate-spin" /> : <>Access Portal <ArrowRight className="ml-2" size={18} /></>}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                    <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                        Return to main site
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
