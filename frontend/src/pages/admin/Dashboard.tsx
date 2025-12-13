
import React from 'react';
import AdminLayout from './AdminLayout';
import { useApp } from '../../context/AppContext';
import { Book, Users, Star, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; trend?: string }> = ({ title, value, icon: Icon, color, trend }) => (
  <div 
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between animate-fade-in"
  >
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      {trend && <p className="text-xs text-green-600 flex items-center mt-2"><TrendingUp size={12} className="mr-1" /> {trend}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { books, authors, reviews } = useApp();

  // Calculate Stats
  const totalBooks = books.length;
  const totalAuthors = authors.length;
  const totalReviews = reviews.length;
  
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  // Calculate Genre Distribution
  const genreCounts = books.flatMap(b => b.genres).reduce<Record<string, number>>((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const sortedGenres = (Object.entries(genreCounts) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5

  const maxGenreCount = Math.max(...(Object.values(genreCounts) as number[]), 1);

  return (
    <AdminLayout title="Dashboard">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Books" value={totalBooks} icon={Book} color="bg-blue-500" trend="+12% this month" />
        <StatCard title="Total Authors" value={totalAuthors} icon={Users} color="bg-purple-500" trend="+4% this month" />
        <StatCard title="Total Reviews" value={totalReviews} icon={MessageSquare} color="bg-brand-500" trend="+18% this month" />
        <StatCard title="Average Rating" value={averageRating} icon={Star} color="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Visualization */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-900 mb-6">Popular Genres</h3>
           <div className="space-y-4">
             {sortedGenres.map(([genre, count]) => (
               <div key={genre}>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="font-medium text-gray-700">{genre}</span>
                   <span className="text-gray-500">{count} books</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2.5">
                   <div 
                     style={{ width: `${(count / maxGenreCount) * 100}%`, transition: 'width 1s ease-out' }}
                     className="bg-brand-500 h-2.5 rounded-full"
                   ></div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Recent Activity / System Report */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-900 mb-6">System Report</h3>
           <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm text-green-800 font-medium">System Status: Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <span className="text-gray-600 text-sm">Database Version</span>
                <span className="font-mono text-sm text-gray-900">v2.4.0</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                 <span className="text-gray-600 text-sm">Last Backup</span>
                 <span className="font-mono text-sm text-gray-900">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                 <span className="text-gray-600 text-sm">Pending Updates</span>
                 <span className="font-mono text-sm text-gray-900">0</span>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
