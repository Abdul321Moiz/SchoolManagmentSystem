import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { FiCalendar, FiCheck, FiX, FiDownload, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import { Card, Button, Select, Table, Badge, Avatar, Input } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const AttendancePage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection, selectedDate]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockStudents = Array.from({ length: 30 }, (_, i) => ({
        id: `STU${String(i + 1).padStart(4, '0')}`,
        firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'William', 'Olivia'][i % 10],
        lastName: ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson'][i % 10],
        rollNumber: i + 1,
        avatar: null,
      }));

      // Initialize attendance (mock: random attendance for past dates)
      const initialAttendance = {};
      mockStudents.forEach((student) => {
        initialAttendance[student.id] = Math.random() > 0.1 ? 'present' : Math.random() > 0.5 ? 'absent' : 'late';
      });

      setStudents(mockStudents);
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // await api.post('/attendance', { class: selectedClass, section: selectedSection, date: selectedDate, attendance });
      toast.success('Attendance saved successfully!');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter((s) => s === 'present').length;
    const absent = Object.values(attendance).filter((s) => s === 'absent').length;
    const late = Object.values(attendance).filter((s) => s === 'late').length;
    return { total, present, absent, late, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  const stats = getStats();

  const classOptions = Array.from({ length: 12 }, (_, i) => ({
    value: `grade-${i + 1}`,
    label: `Grade ${i + 1}`,
  }));

  const sectionOptions = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
  ];

  const columns = [
    {
      key: 'rollNumber',
      header: 'Roll No.',
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (_, student) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${student.firstName} ${student.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{student.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (_, student) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleAttendanceChange(student.id, 'present')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              attendance[student.id] === 'present'
                ? 'bg-success-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-success-100 dark:hover:bg-success-900/30'
            }`}
          >
            <FiCheck className="w-4 h-4 inline mr-1" />
            Present
          </button>
          <button
            onClick={() => handleAttendanceChange(student.id, 'absent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              attendance[student.id] === 'absent'
                ? 'bg-danger-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-danger-100 dark:hover:bg-danger-900/30'
            }`}
          >
            <FiX className="w-4 h-4 inline mr-1" />
            Absent
          </button>
          <button
            onClick={() => handleAttendanceChange(student.id, 'late')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              attendance[student.id] === 'late'
                ? 'bg-warning-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-warning-100 dark:hover:bg-warning-900/30'
            }`}
          >
            Late
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, student) => (
        <Badge
          variant={
            attendance[student.id] === 'present' ? 'success' :
            attendance[student.id] === 'absent' ? 'danger' : 'warning'
          }
          size="sm"
        >
          {attendance[student.id] || 'Not Marked'}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Attendance - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Attendance', path: '/attendance' },
          ]}
        />
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Student Attendance
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Mark and manage daily attendance
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={FiDownload}>
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Class"
              options={classOptions}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full md:w-48"
            />
            <Select
              label="Section"
              options={sectionOptions}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full md:w-48"
            />
            <Input
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </Card.Content>
      </Card>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="text-center">
            <Card.Content>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
            </Card.Content>
          </Card>
          <Card className="text-center">
            <Card.Content>
              <p className="text-2xl font-bold text-success-600">{stats.present}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
            </Card.Content>
          </Card>
          <Card className="text-center">
            <Card.Content>
              <p className="text-2xl font-bold text-danger-600">{stats.absent}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
            </Card.Content>
          </Card>
          <Card className="text-center">
            <Card.Content>
              <p className="text-2xl font-bold text-warning-600">{stats.late}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Late</p>
            </Card.Content>
          </Card>
          <Card className="text-center">
            <Card.Content>
              <p className="text-2xl font-bold text-primary-600">{stats.percentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && selectedSection ? (
        <Card>
          <Card.Header>
            <Card.Title>
              Attendance for {formatDate(selectedDate)}
            </Card.Title>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}>
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>
                Mark All Absent
              </Button>
            </div>
          </Card.Header>
          <Table
            columns={columns}
            data={students}
            loading={loading}
            emptyMessage="No students found"
          />
          <Card.Footer>
            <Button variant="ghost" onClick={() => fetchStudents()}>
              Reset
            </Button>
            <Button onClick={handleSave} loading={saving} icon={FiSave}>
              Save Attendance
            </Button>
          </Card.Footer>
        </Card>
      ) : (
        <Card>
          <Card.Content className="py-12 text-center">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Select Class and Section
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please select a class and section to mark attendance
            </p>
          </Card.Content>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default AttendancePage;
