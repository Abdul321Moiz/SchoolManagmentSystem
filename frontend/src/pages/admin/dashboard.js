import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout';
import { Card, Spinner } from '@/components/ui';
import { 
  FiUsers, 
  FiGrid, 
  FiDollarSign, 
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import api from '@/lib/api';

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // For now, use mock data since we may not have all API endpoints ready
        setStats({
          totalSchools: 15,
          activeSchools: 12,
          totalUsers: 1250,
          totalRevenue: 125000,
          recentSchools: [
            { id: 1, name: 'Demo School', status: 'active', students: 450 },
            { id: 2, name: 'ABC Academy', status: 'active', students: 380 },
            { id: 3, name: 'XYZ School', status: 'pending', students: 0 },
          ],
          subscriptionStats: {
            active: 10,
            trial: 3,
            expired: 2
          }
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'super_admin') {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}! Here's what's happening with OSMS.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Schools"
            value={stats?.totalSchools || 0}
            icon={FiGrid}
            color="bg-blue-500"
            change={8}
          />
          <StatCard
            title="Active Schools"
            value={stats?.activeSchools || 0}
            icon={FiCheckCircle}
            color="bg-green-500"
            change={5}
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || 0}
            icon={FiUsers}
            color="bg-purple-500"
            change={12}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={FiDollarSign}
            color="bg-yellow-500"
            change={15}
          />
        </div>

        {/* Subscription Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Active</span>
                </div>
                <span className="font-semibold">{stats?.subscriptionStats?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiClock className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-gray-600">Trial</span>
                </div>
                <span className="font-semibold">{stats?.subscriptionStats?.trial || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-gray-600">Expired</span>
                </div>
                <span className="font-semibold">{stats?.subscriptionStats?.expired || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="col-span-1 lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Schools</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">School Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentSchools?.map((school) => (
                    <tr key={school.id} className="border-b last:border-0">
                      <td className="py-3 text-sm text-gray-900">{school.name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          school.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {school.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{school.students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/schools/add')}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <FiGrid className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Add School</span>
            </button>
            <button 
              onClick={() => router.push('/admin/users')}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <FiUsers className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </button>
            <button 
              onClick={() => router.push('/admin/subscriptions')}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <FiDollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Subscriptions</span>
            </button>
            <button 
              onClick={() => router.push('/admin/reports')}
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              <FiActivity className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
