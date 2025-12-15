import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usersApi } from '../services/api';
import { User, Theme } from '../types';
import { User as UserIcon, Sun, Moon, Monitor, LogOut, Save, Loader, Sparkles } from 'lucide-react';

const Settings: React.FC = () => {
    const { user, setUser, logout, theme, setTheme } = useApp();
    const navigate = useNavigate();

    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    useEffect(() => {
        if (user) {
            setNickname(user.nickname || '');
            setAge(user.age || '');
            setBio(user.bio || '');
        }
    }, [user]);

    const handleGenerateNickname = async () => {
        setGenerating(true);
        try {
            const newNickname = await usersApi.generateNickname();
            setNickname(newNickname);
        } catch (error) {
            console.error('Error generating nickname:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setLoading(true);
        setSaveStatus('saving');
        try {
            const updatedData = {
                nickname,
                age: Number(age) || null,
                bio,
                profile_completed: true
            };

            const result = await usersApi.updateMe(updatedData);

            const updatedUser: User = {
                ...user,
                nickname: result.nickname,
                age: result.age,
                bio: result.bio || "",
                profileCompleted: true
            };

            setUser(updatedUser);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
        { value: 'light', icon: <Sun size={18} />, label: 'Light' },
        { value: 'dark', icon: <Moon size={18} />, label: 'Dark' },
        { value: 'gray', icon: <Monitor size={18} />, label: 'System' },
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Settings</h1>

                {/* Profile Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-50 rounded-lg">
                            <UserIcon size={20} className="text-brand-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nickname
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    placeholder="Your display name"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateNickname}
                                    disabled={generating}
                                    className="px-4 py-2.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Sparkles size={14} />
                                    {generating ? '...' : 'Random'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                min="13"
                                max="120"
                                value={age}
                                onChange={(e) => setAge(parseInt(e.target.value) || '')}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                placeholder="Your age"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio
                            </label>
                            <textarea
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${saveStatus === 'saved'
                                    ? 'bg-green-500 text-white'
                                    : saveStatus === 'error'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-brand-600 text-white hover:bg-brand-700'
                                }`}
                        >
                            {loading ? (
                                <Loader size={18} className="animate-spin" />
                            ) : saveStatus === 'saved' ? (
                                <>✓ Saved</>
                            ) : saveStatus === 'error' ? (
                                <>Failed to save</>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Theme Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Sun size={20} className="text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
                    </div>

                    <div className="flex gap-3">
                        {themes.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${theme === t.value
                                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                {t.icon}
                                <span className="font-medium text-sm">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <LogOut size={20} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Account</h2>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 px-4 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
