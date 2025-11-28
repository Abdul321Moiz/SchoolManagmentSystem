import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiFilter,
  FiPrinter,
  FiMail,
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Card,
  Button,
  Select,
  Badge,
  Spinner,
  Tabs,
} from '../../components/ui';
import { LineChart, BarChart, DoughnutChart } from '../../components/dashboard/Charts';

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const years = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
  ];

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const classes = [
    { value: '', label: 'All Classes' },
    { value: 'class-9', label: 'Class 9' },
    { value: 'class-10', label: 'Class 10' },
    { value: 'class-11', label: 'Class 11' },
    { value: 'class-12', label: 'Class 12' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'academic', label: 'Academic', icon: FiFileText },
    { id: 'attendance', label: 'Attendance', icon: FiUsers },
    { id: 'financial', label: 'Financial', icon: FiDollarSign },
  ];

  // Chart data
  const enrollmentTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Enrollments',
        data: [45, 52, 38, 65, 48, 35, 120, 95, 78, 45, 32, 28],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const attendanceData = {
    labels: ['Present', 'Absent', 'Late', 'Leave'],
    datasets: [
      {
        data: [85, 8, 4, 3],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  const feeCollectionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Collected',
        data: [125000, 145000, 138000, 152000, 168000, 155000],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Pending',
        data: [25000, 18000, 22000, 15000, 12000, 20000],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const examResultsData = {
    labels: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    datasets: [
      {
        label: 'Pass %',
        data: [92, 88, 85, 90],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Distinction %',
        data: [45, 38, 42, 55],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
  };

  const subjectPerformanceData = {
    labels: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Computer'],
    datasets: [
      {
        label: 'Average Score',
        data: [75, 82, 78, 85, 80, 88],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
        ],
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoading(false);
    };

    fetchData();
  }, [selectedYear, selectedMonth, selectedClass, activeTab]);

  const reportCards = [
    {
      title: 'Student Report',
      description: 'Individual student performance and attendance report',
      icon: FiUsers,
      color: 'blue',
      action: () => router.push('/reports/student'),
    },
    {
      title: 'Class Report',
      description: 'Class-wise academic performance analysis',
      icon: FiBarChart2,
      color: 'green',
      action: () => router.push('/reports/class'),
    },
    {
      title: 'Attendance Report',
      description: 'Daily, monthly, and yearly attendance statistics',
      icon: FiCalendar,
      color: 'purple',
      action: () => router.push('/reports/attendance'),
    },
    {
      title: 'Fee Report',
      description: 'Fee collection and pending payments report',
      icon: FiDollarSign,
      color: 'orange',
      action: () => router.push('/reports/fees'),
    },
    {
      title: 'Exam Report',
      description: 'Examination results and analysis',
      icon: FiFileText,
      color: 'pink',
      action: () => router.push('/reports/exams'),
    },
    {
      title: 'Teacher Report',
      description: 'Teacher performance and workload report',
      icon: FiUsers,
      color: 'teal',
      action: () => router.push('/reports/teachers'),
    },
  ];

  const quickStats = [
    {
      label: 'Total Students',
      value: '1,250',
      change: '+5.2%',
      trend: 'up',
      color: 'blue',
    },
    {
      label: 'Avg. Attendance',
      value: '92.5%',
      change: '+2.1%',
      trend: 'up',
      color: 'green',
    },
    {
      label: 'Fee Collection',
      value: '$485,000',
      change: '+8.3%',
      trend: 'up',
      color: 'purple',
    },
    {
      label: 'Pass Rate',
      value: '89%',
      change: '-1.2%',
      trend: 'down',
      color: 'orange',
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Reports | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and analyze school reports
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiPrinter}>
              Print
            </Button>
            <Button variant="secondary" icon={FiMail}>
              Email
            </Button>
            <Button variant="primary" icon={FiDownload}>
              Export All
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <FiTrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  {stat.change}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiFilter className="w-5 h-5" />
              <span className="font-medium">Filters:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Select
                options={years}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:w-32"
              />
              <Select
                options={months}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-40"
              />
              <Select
                options={classes}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportCards.map((report, index) => (
                    <Card
                      key={index}
                      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={report.action}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/50`}>
                          <report.icon className={`w-6 h-6 text-${report.color}-600 dark:text-${report.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Enrollment Trend
                    </h3>
                    <LineChart data={enrollmentTrendData} />
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Attendance Distribution
                    </h3>
                    <DoughnutChart data={attendanceData} />
                  </Card>
                </div>
              </div>
            )}

            {/* Academic Tab */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Exam Results by Class
                    </h3>
                    <BarChart data={examResultsData} />
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Subject Performance
                    </h3>
                    <BarChart data={subjectPerformanceData} />
                  </Card>
                </div>

                {/* Academic Stats Table */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Academic Performance Summary
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b dark:border-gray-700">
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Class</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Students</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Avg. Score</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Pass %</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Distinction %</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Top Performer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {[
                          { class: 'Class 12-A', students: 45, avg: 78.5, pass: 95, distinction: 42, top: 'Sarah Johnson' },
                          { class: 'Class 12-B', students: 42, avg: 75.2, pass: 92, distinction: 38, top: 'Mike Wilson' },
                          { class: 'Class 11-A', students: 48, avg: 72.8, pass: 88, distinction: 35, top: 'Emily Davis' },
                          { class: 'Class 11-B', students: 46, avg: 74.1, pass: 90, distinction: 37, top: 'John Smith' },
                          { class: 'Class 10-A', students: 50, avg: 76.3, pass: 94, distinction: 40, top: 'Anna Brown' },
                        ].map((row, index) => (
                          <tr key={index}>
                            <td className="py-3 font-medium text-gray-900 dark:text-white">{row.class}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{row.students}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{row.avg}%</td>
                            <td className="py-3">
                              <Badge variant={row.pass >= 90 ? 'success' : 'warning'}>{row.pass}%</Badge>
                            </td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{row.distinction}%</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{row.top}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Overall Attendance Distribution
                    </h3>
                    <DoughnutChart data={attendanceData} />
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Monthly Attendance Trend
                    </h3>
                    <LineChart
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [
                          {
                            label: 'Students',
                            data: [92, 94, 91, 93, 90, 95],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                          },
                          {
                            label: 'Teachers',
                            data: [98, 97, 99, 98, 96, 98],
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            fill: true,
                          },
                        ],
                      }}
                    />
                  </Card>
                </div>

                {/* Attendance Stats */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Class-wise Attendance Summary
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b dark:border-gray-700">
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Class</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Total Students</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Present Today</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Absent</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Avg. Attendance</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {[
                          { class: 'Class 12-A', total: 45, present: 42, absent: 3, avg: 93.5 },
                          { class: 'Class 12-B', total: 42, present: 40, absent: 2, avg: 95.2 },
                          { class: 'Class 11-A', total: 48, present: 44, absent: 4, avg: 91.8 },
                          { class: 'Class 11-B', total: 46, present: 43, absent: 3, avg: 93.4 },
                          { class: 'Class 10-A', total: 50, present: 46, absent: 4, avg: 92.0 },
                        ].map((row, index) => (
                          <tr key={index}>
                            <td className="py-3 font-medium text-gray-900 dark:text-white">{row.class}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{row.total}</td>
                            <td className="py-3 text-green-600">{row.present}</td>
                            <td className="py-3 text-red-600">{row.absent}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{row.avg}%</td>
                            <td className="py-3">
                              <Badge variant={row.avg >= 93 ? 'success' : row.avg >= 90 ? 'warning' : 'error'}>
                                {row.avg >= 93 ? 'Good' : row.avg >= 90 ? 'Average' : 'Low'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Fee Collection Trend
                    </h3>
                    <BarChart data={feeCollectionData} />
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Fee Collection Status
                    </h3>
                    <DoughnutChart
                      data={{
                        labels: ['Collected', 'Pending', 'Overdue'],
                        datasets: [
                          {
                            data: [75, 15, 10],
                            backgroundColor: [
                              'rgba(34, 197, 94, 0.8)',
                              'rgba(249, 115, 22, 0.8)',
                              'rgba(239, 68, 68, 0.8)',
                            ],
                          },
                        ],
                      }}
                    />
                  </Card>
                </div>

                {/* Financial Summary */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">Total Collected</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">$485,000</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-orange-600 dark:text-orange-400">Pending</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">$65,000</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">$28,500</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b dark:border-gray-700">
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Fee Type</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Expected</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Collected</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Pending</th>
                          <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Collection %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {[
                          { type: 'Tuition Fee', expected: 350000, collected: 315000, pending: 35000 },
                          { type: 'Transport Fee', expected: 85000, collected: 72000, pending: 13000 },
                          { type: 'Lab Fee', expected: 45000, collected: 42000, pending: 3000 },
                          { type: 'Library Fee', expected: 25000, collected: 23500, pending: 1500 },
                          { type: 'Sports Fee', expected: 30000, collected: 27500, pending: 2500 },
                        ].map((row, index) => (
                          <tr key={index}>
                            <td className="py-3 font-medium text-gray-900 dark:text-white">{row.type}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">${row.expected.toLocaleString()}</td>
                            <td className="py-3 text-green-600">${row.collected.toLocaleString()}</td>
                            <td className="py-3 text-red-600">${row.pending.toLocaleString()}</td>
                            <td className="py-3">
                              <Badge variant={((row.collected / row.expected) * 100) >= 90 ? 'success' : 'warning'}>
                                {((row.collected / row.expected) * 100).toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
