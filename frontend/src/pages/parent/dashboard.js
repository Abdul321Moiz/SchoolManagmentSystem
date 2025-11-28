import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { FiUsers, FiCalendar, FiAward, FiDollarSign, FiBell, FiFileText } from 'react-icons/fi';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import { Card, Button, Badge, Avatar, Tabs } from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';

const ParentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState({
    attendance: [],
    results: [],
    fees: [],
    notifications: [],
  });

  useEffect(() => {
    // Mock data - children
    const mockChildren = [
      {
        id: 'STU001',
        name: 'John Doe Jr.',
        class: 'Grade 5-A',
        rollNumber: 12,
        avatar: null,
        attendanceRate: 95,
        averageGrade: 'A-',
      },
      {
        id: 'STU002',
        name: 'Jane Doe',
        class: 'Grade 3-B',
        rollNumber: 8,
        avatar: null,
        attendanceRate: 92,
        averageGrade: 'A',
      },
    ];

    setChildren(mockChildren);
    if (mockChildren.length > 0) {
      setSelectedChild(mockChildren[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedChild) {
      // Mock child-specific data
      setChildData({
        attendance: [
          { date: '2024-02-10', status: 'present' },
          { date: '2024-02-09', status: 'present' },
          { date: '2024-02-08', status: 'absent' },
          { date: '2024-02-07', status: 'present' },
          { date: '2024-02-06', status: 'present' },
        ],
        results: [
          { id: 1, exam: 'Unit Test 1', subject: 'Mathematics', score: 88, total: 100, grade: 'A' },
          { id: 2, exam: 'Unit Test 1', subject: 'Science', score: 92, total: 100, grade: 'A+' },
          { id: 3, exam: 'Quiz', subject: 'English', score: 42, total: 50, grade: 'A-' },
        ],
        fees: [
          { id: 1, type: 'Tuition Fee', amount: 5000, dueDate: '2024-03-01', status: 'pending' },
          { id: 2, type: 'Transport Fee', amount: 1000, dueDate: '2024-02-15', status: 'paid' },
        ],
        notifications: [
          { id: 1, title: 'Parent-Teacher Meeting', message: 'Scheduled for Feb 20 at 3 PM', time: '1 day ago' },
          { id: 2, title: 'Exam Schedule', message: 'Mid-term exams from Feb 25-28', time: '3 days ago' },
        ],
      });
    }
  }, [selectedChild]);

  return (
    <DashboardLayout>
      <Head>
        <title>Parent Dashboard - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/parent/dashboard' }]} />
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your children&apos;s academic progress
          </p>
        </div>
      </div>

      {/* Children Selection */}
      <Card className="mb-6">
        <Card.Content>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Child
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors min-w-fit ${
                  selectedChild?.id === child.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Avatar name={child.name} size="md" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{child.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{child.class}</p>
                </div>
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {selectedChild && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <Card.Content className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChild.attendanceRate}%
                  </p>
                </div>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChild.averageGrade}
                  </p>
                </div>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <FiDollarSign className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Fees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(
                      childData.fees
                        .filter((f) => f.status === 'pending')
                        .reduce((sum, f) => sum + f.amount, 0)
                    )}
                  </p>
                </div>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                  <FiBell className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notifications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {childData.notifications.length}
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Attendance */}
            <Card>
              <Card.Header>
                <Card.Title>Recent Attendance</Card.Title>
                <Link href="/parent/attendance" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {childData.attendance.map((record, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDate(record.date)}
                      </span>
                      <Badge
                        variant={record.status === 'present' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            {/* Recent Results */}
            <Card>
              <Card.Header>
                <Card.Title>Recent Results</Card.Title>
                <Link href="/parent/results" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {childData.results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.subject}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.exam}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="success" size="sm">{result.grade}</Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {result.score}/{result.total}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            {/* Pending Fees */}
            <Card>
              <Card.Header>
                <Card.Title>Fee Status</Card.Title>
                <Link href="/parent/fees" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {childData.fees.map((fee) => (
                    <div
                      key={fee.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {fee.type}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Due: {formatDate(fee.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={fee.status === 'paid' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {fee.status}
                        </Badge>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {formatCurrency(fee.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            {/* Notifications */}
            <Card>
              <Card.Header>
                <Card.Title>Notifications</Card.Title>
                <Link href="/parent/notifications" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {childData.notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <FiBell className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;
