import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';
import { FiPlus, FiCalendar, FiUsers, FiArrowRight, FiClock, FiBook } from 'react-icons/fi';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import StatsCard from '@/components/dashboard/StatsCard';
import {
  AttendanceChart,
  FeeCollectionChart,
  StudentDistributionChart,
  PerformanceChart,
} from '@/components/dashboard/Charts';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    todayAttendance: 0,
    pendingFees: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, this would fetch from the API
      // const response = await api.get('/dashboard/stats');
      // setStats(response.data);

      // Mock data for demonstration
      setStats({
        totalStudents: 1250,
        totalTeachers: 85,
        totalClasses: 45,
        totalRevenue: 125000,
        todayAttendance: 92,
        pendingFees: 15000,
      });

      setRecentActivities([
        { id: 1, type: 'student', message: 'New student John Doe enrolled in Grade 5', time: '2 hours ago' },
        { id: 2, type: 'fee', message: 'Fee payment received from Sarah Wilson', time: '3 hours ago' },
        { id: 3, type: 'attendance', message: 'Attendance marked for Grade 3A', time: '4 hours ago' },
        { id: 4, type: 'exam', message: 'Mid-term exam results published', time: '5 hours ago' },
        { id: 5, type: 'assignment', message: 'New assignment added for Math class', time: '6 hours ago' },
      ]);

      setUpcomingEvents([
        { id: 1, title: 'Parent-Teacher Meeting', date: '2024-02-15', type: 'meeting' },
        { id: 2, title: 'Science Fair', date: '2024-02-20', type: 'event' },
        { id: 3, title: 'Mid-Term Exams', date: '2024-02-25', type: 'exam' },
        { id: 4, title: 'Sports Day', date: '2024-03-01', type: 'event' },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - OSMS</title>
      </Head>

      {/* Header */}
      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/dashboard' }]} />
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Here&apos;s what&apos;s happening at your school today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={FiCalendar}>
              <span className="hidden sm:inline">Today:</span> {formatDate(new Date())}
            </Button>
            <Link href="/students/add">
              <Button icon={FiPlus}>
                Add Student
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          icon="students"
          variant="primary"
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers.toLocaleString()}
          icon="teachers"
          variant="success"
          trend="up"
          trendValue="+5%"
        />
        <StatsCard
          title="Today's Attendance"
          value={`${stats.todayAttendance}%`}
          icon="attendance"
          variant="warning"
          trend="down"
          trendValue="-2%"
        />
        <StatsCard
          title="Revenue (This Month)"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="revenue"
          variant="secondary"
          trend="up"
          trendValue="+18%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AttendanceChart />
        <FeeCollectionChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <StudentDistributionChart />
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Activities</Card.Title>
            <Link href="/activities" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <Card.Header>
            <Card.Title>Upcoming Events</Card.Title>
            <Link href="/events" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      event.type === 'exam' ? 'danger' :
                      event.type === 'meeting' ? 'warning' : 'primary'
                    }
                    size="sm"
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Add Student', icon: FiUsers, href: '/students/add', color: 'primary' },
              { label: 'Mark Attendance', icon: FiCalendar, href: '/attendance/mark', color: 'success' },
              { label: 'Create Exam', icon: FiBook, href: '/exams/create', color: 'warning' },
              { label: 'Collect Fee', icon: FiPlus, href: '/fees/collect', color: 'danger' },
              { label: 'Send Notice', icon: FiArrowRight, href: '/notifications/send', color: 'secondary' },
              { label: 'Generate Report', icon: FiBook, href: '/reports', color: 'primary' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center mb-2`}>
                  <action.icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </Card.Content>
      </Card>
    </DashboardLayout>
  );
};

export default DashboardPage;
