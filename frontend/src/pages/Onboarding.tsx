
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usersApi } from '../services/api';
import { User } from '../types';

const Onboarding: React.FC = () => {
    const { user, setUser } = useApp();
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.nickname) setNickname(user.nickname);
            if (user.age) setAge(user.age);
            if (user.bio) setBio(user.bio);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const updatedData = {
                nickname,
                age: Number(age),
                bio,
                profile_completed: true
            };

            // Update backend
            const result = await usersApi.updateMe(updatedData);

            // Update local context
            // We need to map the backend response (which uses snake_case) to our frontend User type
            // However, updateMe returns User (frontend type in api.ts definition? No, it returns backend dict usually, let's check mapping in AppContext)
            // Wait, usersApi.updateMe calls apiRequest<User>
            // The User interface in api.ts matches backend response (snake_case)
            // BUT AppContext expects User interface from types.ts (camelCase)

            // Manually map for local update
            const updatedUser: User = {
                ...user,
                nickname: result.nickname,
                age: result.age,
                bio: result.bio || "",
                profileCompleted: true // Force true
            };

            setUser(updatedUser);
            navigate('/');
        } catch (error) {
            console.error('Onboarding failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to BookNook!</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Let's set up your profile to get you started.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                                Nickname (Visible to others)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="nickname"
                                    name="nickname"
                                    type="text"
                                    required
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                                    placeholder="CoolReader123"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateNickname}
                                    disabled={generating}
                                    className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                                >
                                    {generating ? '...' : 'Random'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                Age
                            </label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="13"
                                max="120"
                                required
                                value={age}
                                onChange={(e) => setAge(parseInt(e.target.value) || '')}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                                placeholder="25"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                                placeholder="Tell us about your reading interests..."
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Complete Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
