import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui';

const AdminUsersPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated || user?.role !== 'super_admin') {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage platform users</p>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Users</h2>
          <p className="text-gray-500">Users list will be displayed here.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
