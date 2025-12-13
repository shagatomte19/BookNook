
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminApi, ContentModerationItem } from '../../services/api';
import { CheckCircle, XCircle, FileText, MessageSquare, Clock, AlertCircle } from 'lucide-react';

const ContentModeration: React.FC = () => {
    const [items, setItems] = useState<ContentModerationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPendingContent = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getPendingContent();
            setItems(data);
            setError(null);
        } catch (err: any) {
            setError(err.detail || 'Failed to fetch pending content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingContent();
    }, []);

    const handleApprove = async (item: ContentModerationItem) => {
        try {
            setProcessingId(item.id);
            await adminApi.approveContent(item.type as 'review' | 'post', item.id);
            setItems(items.filter(i => i.id !== item.id));
        } catch (err: any) {
            alert(err.detail || 'Failed to approve content');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (item: ContentModerationItem) => {
        try {
            setProcessingId(item.id);
            await adminApi.rejectContent(item.type as 'review' | 'post', item.id);
            setItems(items.filter(i => i.id !== item.id));
        } catch (err: any) {
            alert(err.detail || 'Failed to reject content');
        } finally {
            setProcessingId(null);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'review':
                return <MessageSquare size={16} className="text-blue-500" />;
            case 'post':
                return <FileText size={16} className="text-purple-500" />;
            default:
                return <FileText size={16} />;
        }
    };

    return (
        <AdminLayout title="Content Moderation">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                        <Clock size={24} className="text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Items</p>
                        <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <MessageSquare size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {items.filter(i => i.type === 'review').length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg mr-4">
                        <FileText size={24} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Posts</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {items.filter(i => i.type === 'post').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Content List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">No content is waiting for moderation.</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center mb-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                            {getTypeIcon(item.type)}
                                            <span className="ml-1 capitalize">{item.type}</span>
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            by <span className="font-medium text-gray-700">{item.author_name}</span>
                                        </span>
                                        {item.created_at && (
                                            <span className="text-sm text-gray-400 ml-2">
                                                • {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    {item.title && (
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
                                    )}

                                    {/* Content Preview */}
                                    {item.content && (
                                        <p className="text-gray-600 line-clamp-3">{item.content}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => handleApprove(item)}
                                        disabled={processingId === item.id}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(item)}
                                        disabled={processingId === item.id}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle size={16} className="mr-2" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Note */}
            {items.length > 0 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                    <AlertCircle size={20} className="text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-800">
                            <strong>Moderation Guidelines:</strong> Approve content that follows community guidelines.
                            Reject spam, inappropriate content, or policy violations.
                        </p>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ContentModeration;
