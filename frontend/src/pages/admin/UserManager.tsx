
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminApi, User } from '../../services/api';
import { Search, Shield, ShieldOff, UserX, UserCheck, Trash2, MoreVertical } from 'lucide-react';

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAdmin, setFilterAdmin] = useState<boolean | undefined>(undefined);
    const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers({
                search: searchTerm || undefined,
                is_admin: filterAdmin,
                is_active: filterActive,
                limit: 100,
            });
            setUsers(data);
            setError(null);
        } catch (err: any) {
            setError(err.detail || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filterAdmin, filterActive]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleToggleAdmin = async (userId: string) => {
        try {
            await adminApi.toggleAdmin(userId);
            fetchUsers();
            setActionMenuOpen(null);
        } catch (err: any) {
            alert(err.detail || 'Failed to toggle admin status');
        }
    };

    const handleToggleActive = async (userId: string) => {
        try {
            await adminApi.toggleActive(userId);
            fetchUsers();
            setActionMenuOpen(null);
        } catch (err: any) {
            alert(err.detail || 'Failed to toggle active status');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        try {
            await adminApi.deleteUser(userId);
            fetchUsers();
            setActionMenuOpen(null);
        } catch (err: any) {
            alert(err.detail || 'Failed to delete user');
        }
    };

    return (
        <AdminLayout title="User Management">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>

                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            value={filterAdmin === undefined ? '' : filterAdmin.toString()}
                            onChange={(e) => setFilterAdmin(e.target.value === '' ? undefined : e.target.value === 'true')}
                        >
                            <option value="">All Roles</option>
                            <option value="true">Admins Only</option>
                            <option value="false">Regular Users</option>
                        </select>

                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            value={filterActive === undefined ? '' : filterActive.toString()}
                            onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true')}
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Banned</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500 md:hidden">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.is_admin ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <Shield size={12} className="mr-1" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Banned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                            {user.joined_date || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {actionMenuOpen === user.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleToggleAdmin(user.id)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {user.is_admin ? (
                                                                    <>
                                                                        <ShieldOff size={16} className="mr-2" /> Remove Admin
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Shield size={16} className="mr-2" /> Make Admin
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleActive(user.id)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {user.is_active ? (
                                                                    <>
                                                                        <UserX size={16} className="mr-2" /> Ban User
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck size={16} className="mr-2" /> Unban User
                                                                    </>
                                                                )}
                                                            </button>
                                                            <hr className="my-1" />
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 size={16} className="mr-2" /> Delete User
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Click outside to close menu */}
            {actionMenuOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setActionMenuOpen(null)}
                />
            )}
        </AdminLayout>
    );
};

export default UserManager;
