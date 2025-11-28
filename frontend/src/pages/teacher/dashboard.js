import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { FiUsers, FiBookOpen, FiClock, FiCalendar, FiCheckSquare, FiClipboard, FiFileText, FiBell } from 'react-icons/fi';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import StatsCard from '@/components/dashboard/StatsCard';
import { AttendanceChart, PerformanceChart } from '@/components/dashboard/Charts';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    todayClasses: 0,
    pendingAssignments: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);

  useEffect(() => {
    // Mock data
    setStats({
      totalClasses: 6,
      totalStudents: 180,
      todayClasses: 4,
      pendingAssignments: 12,
    });

    setTodaySchedule([
      { id: 1, subject: 'Mathematics', class: 'Grade 10-A', time: '8:00 AM - 9:00 AM', room: 'Room 101' },
      { id: 2, subject: 'Mathematics', class: 'Grade 10-B', time: '9:30 AM - 10:30 AM', room: 'Room 102' },
      { id: 3, subject: 'Algebra', class: 'Grade 11-A', time: '11:00 AM - 12:00 PM', room: 'Room 103' },
      { id: 4, subject: 'Calculus', class: 'Grade 12-A', time: '2:00 PM - 3:00 PM', room: 'Room 104' },
    ]);

    setRecentSubmissions([
      { id: 1, student: 'John Doe', assignment: 'Math Homework 5', class: 'Grade 10-A', submittedAt: new Date() },
      { id: 2, student: 'Jane Smith', assignment: 'Algebra Quiz', class: 'Grade 11-A', submittedAt: new Date() },
      { id: 3, student: 'Michael Johnson', assignment: 'Calculus Assignment', class: 'Grade 12-A', submittedAt: new Date() },
    ]);

    setUpcomingExams([
      { id: 1, name: 'Mid-Term Math', class: 'Grade 10', date: '2024-02-20' },
      { id: 2, name: 'Algebra Test', class: 'Grade 11', date: '2024-02-22' },
    ]);
  }, []);

  return (
    <DashboardLayout>
      <Head>
        <title>Teacher Dashboard - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/teacher/dashboard' }]} />
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here&apos;s your teaching overview for today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="My Classes"
          value={stats.totalClasses}
          icon="classes"
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="students"
          variant="success"
        />
        <StatsCard
          title="Today's Classes"
          value={stats.todayClasses}
          icon="attendance"
          variant="warning"
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingAssignments}
          icon="notifications"
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Today&apos;s Schedule</Card.Title>
            <Link href="/teacher/schedule" className="text-sm text-primary-600 hover:text-primary-700">
              View full schedule
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.subject}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.class} • {item.room}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="primary" size="sm">
                      <FiClock className="w-3 h-3 mr-1" />
                      {item.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <Link href="/teacher/attendance">
                <Button variant="outline" fullWidth icon={FiCheckSquare}>
                  Mark Attendance
                </Button>
              </Link>
              <Link href="/teacher/assignments/create">
                <Button variant="outline" fullWidth icon={FiClipboard}>
                  Create Assignment
                </Button>
              </Link>
              <Link href="/teacher/exams">
                <Button variant="outline" fullWidth icon={FiFileText}>
                  Enter Marks
                </Button>
              </Link>
              <Link href="/teacher/notifications">
                <Button variant="outline" fullWidth icon={FiBell}>
                  Send Notification
                </Button>
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Submissions</Card.Title>
            <Link href="/teacher/assignments" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={submission.student} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {submission.student}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {submission.assignment}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Review</Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <Card.Header>
            <Card.Title>Upcoming Exams</Card.Title>
            <Link href="/teacher/exams" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {exam.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {exam.class}
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">
                    {formatDate(exam.date)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Performance Chart */}
      <div className="mt-6">
        <PerformanceChart />
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
