import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiPlus, FiSearch, FiDownload, FiMoreVertical,
  FiEdit2, FiTrash2, FiEye, FiMail, FiPhone,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import {
  Card, Button, Input, Select, Table, Badge, Avatar, Dropdown,
  Modal,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';

const TeachersPage = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ open: false, teacher: null });

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, pageSize, selectedDepartment, selectedStatus, searchTerm]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockTeachers = Array.from({ length: 10 }, (_, i) => ({
        id: `TCH${String(i + 1).padStart(4, '0')}`,
        firstName: ['Robert', 'Lisa', 'Mark', 'Jennifer', 'David', 'Amanda', 'Christopher', 'Michelle', 'Daniel', 'Jessica'][i],
        lastName: ['Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez'][i],
        email: `teacher${i + 1}@school.com`,
        phone: `+1 555-${String(2000 + i).padStart(4, '0')}`,
        department: ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Arts', 'Physical Education'][i],
        subjects: [['Math', 'Algebra'], ['Physics', 'Chemistry'], ['English', 'Literature'], ['History', 'Geography'], ['Computer Science'], ['Physics'], ['Chemistry'], ['Biology'], ['Art', 'Music'], ['PE', 'Sports']][i],
        joinDate: new Date(2020 + Math.floor(i / 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: i === 3 ? 'inactive' : 'active',
        avatar: null,
      }));

      setTeachers(mockTeachers);
      setTotalPages(3);
      setTotalTeachers(25);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      toast.success('Teacher deleted successfully');
      setDeleteModal({ open: false, teacher: null });
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const columns = [
    {
      key: 'teacher',
      header: 'Teacher',
      sortable: true,
      render: (_, teacher) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={`${teacher.firstName} ${teacher.lastName}`}
            src={teacher.avatar}
            size="sm"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {teacher.firstName} {teacher.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {teacher.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">{value}</span>
      ),
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((subject) => (
            <Badge key={subject} variant="gray" size="sm">
              {subject}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="gray" size="sm">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (_, teacher) => (
        <div className="text-sm">
          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <FiMail className="w-3.5 h-3.5" />
            {teacher.email}
          </p>
          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mt-0.5">
            <FiPhone className="w-3.5 h-3.5" />
            {teacher.phone}
          </p>
        </div>
      ),
    },
    {
      key: 'joinDate',
      header: 'Joined',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'gray'} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, teacher) => (
        <Dropdown
          align="right"
          trigger={
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          }
        >
          <Dropdown.Item icon={FiEye} onClick={() => router.push(`/teachers/${teacher.id}`)}>
            View Details
          </Dropdown.Item>
          <Dropdown.Item icon={FiEdit2} onClick={() => router.push(`/teachers/${teacher.id}/edit`)}>
            Edit
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={FiTrash2} danger onClick={() => setDeleteModal({ open: true, teacher })}>
            Delete
          </Dropdown.Item>
        </Dropdown>
      ),
    },
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'history', label: 'History' },
    { value: 'computer-science', label: 'Computer Science' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Teachers - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Teachers', path: '/teachers' },
          ]}
        />
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Teachers
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage teaching staff in your school
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={FiDownload}>
              Export
            </Button>
            <Link href="/teachers/add">
              <Button icon={FiPlus}>
                Add Teacher
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={FiSearch}
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select
                options={departmentOptions}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-48"
              />
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={teachers}
          loading={loading}
          emptyMessage="No teachers found"
        />
        <Table.Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalTeachers}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, teacher: null })}
        title="Delete Teacher"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {deleteModal.teacher?.firstName} {deleteModal.teacher?.lastName}
          </span>
          ? This action cannot be undone.
        </p>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, teacher: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTeacher}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default TeachersPage;
