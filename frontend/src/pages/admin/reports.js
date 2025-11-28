import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui';

const AdminReportsPage = () => {
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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Platform-wide reports and analytics</p>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Reports</h2>
          <p className="text-gray-500">Reports and analytics will be displayed here.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReportsPage;
