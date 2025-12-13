
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminApi, AuditLog } from '../../services/api';
import { Clock, User, FileText, Filter } from 'lucide-react';

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterAction, setFilterAction] = useState<string>('');
    const [filterResource, setFilterResource] = useState<string>('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAuditLogs({
                action: filterAction || undefined,
                resource_type: filterResource || undefined,
                limit: 100,
            });
            setLogs(data);
            setError(null);
        } catch (err: any) {
            setError(err.detail || 'Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filterAction, filterResource]);

    const getActionColor = (action: string): string => {
        switch (action) {
            case 'delete_user':
            case 'reject_content':
                return 'bg-red-100 text-red-800';
            case 'approve_content':
            case 'toggle_active':
                return 'bg-green-100 text-green-800';
            case 'toggle_admin':
            case 'update_user':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAction = (action: string): string => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return 'Unknown';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (
        <AdminLayout title="Audit Logs">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center text-gray-500 mr-2">
                        <Filter size={16} className="mr-2" />
                        Filters:
                    </div>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="update_user">Update User</option>
                        <option value="delete_user">Delete User</option>
                        <option value="toggle_admin">Toggle Admin</option>
                        <option value="toggle_active">Toggle Active</option>
                        <option value="approve_content">Approve Content</option>
                        <option value="reject_content">Reject Content</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                        value={filterResource}
                        onChange={(e) => setFilterResource(e.target.value)}
                    >
                        <option value="">All Resources</option>
                        <option value="user">User</option>
                        <option value="book">Book</option>
                        <option value="review">Review</option>
                        <option value="post">Post</option>
                    </select>

                    <button
                        onClick={() => {
                            setFilterAction('');
                            setFilterResource('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Admin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resource
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No audit logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Clock size={14} className="mr-2 text-gray-400" />
                                                {formatDate(log.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User size={14} className="mr-2 text-gray-400" />
                                                <span className="text-sm text-gray-900">{log.user_email || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {formatAction(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm">
                                                <FileText size={14} className="mr-2 text-gray-400" />
                                                <span className="text-gray-900 capitalize">{log.resource_type || '-'}</span>
                                                {log.resource_id && (
                                                    <span className="text-gray-500 ml-1">#{log.resource_id.slice(0, 8)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                            {log.details ? (
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {JSON.stringify(log.details).slice(0, 50)}
                                                    {JSON.stringify(log.details).length > 50 && '...'}
                                                </code>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AuditLogs;
