import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import {
  FiBookOpen, FiCalendar, FiClipboard, FiAward, FiDollarSign, FiBell, FiTruck, FiBook,
} from 'react-icons/fi';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import { AttendanceChart, PerformanceChart } from '@/components/dashboard/Charts';
import { formatDate } from '@/lib/utils';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    pendingAssignments: 0,
    upcomingExams: 0,
    averageGrade: '',
  });
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock data
    setStats({
      attendanceRate: 92,
      pendingAssignments: 3,
      upcomingExams: 2,
      averageGrade: 'A-',
    });

    setTodayClasses([
      { id: 1, subject: 'Mathematics', teacher: 'Mr. Anderson', time: '8:00 AM - 9:00 AM', room: 'Room 101' },
      { id: 2, subject: 'Science', teacher: 'Mrs. Taylor', time: '9:30 AM - 10:30 AM', room: 'Lab 1' },
      { id: 3, subject: 'English', teacher: 'Ms. Johnson', time: '11:00 AM - 12:00 PM', room: 'Room 103' },
      { id: 4, subject: 'History', teacher: 'Mr. Williams', time: '2:00 PM - 3:00 PM', room: 'Room 105' },
    ]);

    setUpcomingAssignments([
      { id: 1, subject: 'Mathematics', title: 'Chapter 5 Exercises', dueDate: '2024-02-15', status: 'pending' },
      { id: 2, subject: 'English', title: 'Essay on Climate Change', dueDate: '2024-02-18', status: 'pending' },
      { id: 3, subject: 'Science', title: 'Lab Report', dueDate: '2024-02-20', status: 'submitted' },
    ]);

    setRecentResults([
      { id: 1, subject: 'Mathematics', exam: 'Unit Test 1', score: 88, grade: 'A', total: 100 },
      { id: 2, subject: 'Science', exam: 'Quiz 3', score: 45, grade: 'A-', total: 50 },
      { id: 3, subject: 'English', exam: 'Mid-Term', score: 78, grade: 'B+', total: 100 },
    ]);

    setNotifications([
      { id: 1, title: 'Exam Schedule Released', message: 'Mid-term exam schedule has been published', time: '2 hours ago' },
      { id: 2, title: 'Fee Reminder', message: 'Please pay your pending fees by Feb 20', time: '1 day ago' },
      { id: 3, title: 'Sports Day', message: 'Annual sports day on March 1st', time: '2 days ago' },
    ]);
  }, []);

  return (
    <DashboardLayout>
      <Head>
        <title>Student Dashboard - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/student/dashboard' }]} />
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here&apos;s your academic overview.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.attendanceRate}%</p>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <FiClipboard className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingAssignments}</p>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Exams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingExams}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageGrade}</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Classes */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Today&apos;s Classes</Card.Title>
            <Link href="/student/classes" className="text-sm text-primary-600 hover:text-primary-700">
              View schedule
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {todayClasses.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <FiBookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.subject}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.teacher} • {item.room}
                      </p>
                    </div>
                  </div>
                  <Badge variant="gray" size="sm">
                    {item.time}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Quick Links */}
        <Card>
          <Card.Header>
            <Card.Title>Quick Links</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/student/assignments">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FiClipboard className="w-6 h-6 text-primary-600 dark:text-primary-400 mb-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Assignments</span>
                </div>
              </Link>
              <Link href="/student/results">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FiAward className="w-6 h-6 text-success-600 dark:text-success-400 mb-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Results</span>
                </div>
              </Link>
              <Link href="/student/fees">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FiDollarSign className="w-6 h-6 text-warning-600 dark:text-warning-400 mb-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fees</span>
                </div>
              </Link>
              <Link href="/student/library">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FiBook className="w-6 h-6 text-secondary-600 dark:text-secondary-400 mb-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Library</span>
                </div>
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Assignments */}
        <Card>
          <Card.Header>
            <Card.Title>Upcoming Assignments</Card.Title>
            <Link href="/student/assignments" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {assignment.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={assignment.status === 'submitted' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {assignment.status}
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Due: {formatDate(assignment.dueDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Recent Results */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Results</Card.Title>
            <Link href="/student/results" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {result.exam}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success" size="sm">
                      {result.grade}
                    </Badge>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {result.score}/{result.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <Card.Header>
          <Card.Title>Notifications</Card.Title>
          <Link href="/student/notifications" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {notifications.map((notification) => (
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
    </DashboardLayout>
  );
};

export default StudentDashboard;
