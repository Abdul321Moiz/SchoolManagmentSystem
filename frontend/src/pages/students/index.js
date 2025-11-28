import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiPlus, FiSearch, FiFilter, FiDownload, FiMoreVertical,
  FiEdit2, FiTrash2, FiEye, FiMail, FiPhone,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import {
  Card, Button, Input, Select, Table, Badge, Avatar, Dropdown,
  Modal, EmptyState, Spinner,
} from '@/components/ui';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

const StudentsPage = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null });
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, pageSize, selectedClass, selectedStatus, searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the API
      // const response = await api.get('/students', {
      //   params: { page: currentPage, limit: pageSize, class: selectedClass, status: selectedStatus, search: searchTerm }
      // });
      // setStudents(response.data.students);
      // setTotalPages(response.data.pagination.totalPages);
      // setTotalStudents(response.data.pagination.total);

      // Mock data for demonstration
      const mockStudents = Array.from({ length: 10 }, (_, i) => ({
        id: `STU${String(i + 1).padStart(4, '0')}`,
        firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'William', 'Olivia'][i],
        lastName: ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson'][i],
        email: `student${i + 1}@school.com`,
        phone: `+1 555-${String(1000 + i).padStart(4, '0')}`,
        class: { name: `Grade ${Math.floor(Math.random() * 12) + 1}`, section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)] },
        admissionDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: ['active', 'active', 'active', 'inactive', 'active', 'active', 'suspended', 'active', 'active', 'active'][i],
        avatar: null,
      }));

      setStudents(mockStudents);
      setTotalPages(5);
      setTotalStudents(50);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    try {
      // await api.delete(`/students/${deleteModal.student.id}`);
      toast.success('Student deleted successfully');
      setDeleteModal({ open: false, student: null });
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      render: (_, student) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={`${student.firstName} ${student.lastName}`}
            src={student.avatar}
            size="sm"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {student.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">
          {value.name} - {value.section}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (_, student) => (
        <div className="text-sm">
          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <FiMail className="w-3.5 h-3.5" />
            {student.email}
          </p>
          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mt-0.5">
            <FiPhone className="w-3.5 h-3.5" />
            {student.phone}
          </p>
        </div>
      ),
    },
    {
      key: 'admissionDate',
      header: 'Admission Date',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge
          variant={
            value === 'active' ? 'success' :
            value === 'inactive' ? 'gray' : 'danger'
          }
          size="sm"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, student) => (
        <Dropdown
          align="right"
          trigger={
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          }
        >
          <Dropdown.Item icon={FiEye} onClick={() => router.push(`/students/${student.id}`)}>
            View Details
          </Dropdown.Item>
          <Dropdown.Item icon={FiEdit2} onClick={() => router.push(`/students/${student.id}/edit`)}>
            Edit
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={FiTrash2} danger onClick={() => setDeleteModal({ open: true, student })}>
            Delete
          </Dropdown.Item>
        </Dropdown>
      ),
    },
  ];

  const classOptions = [
    { value: '', label: 'All Classes' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: `grade-${i + 1}`, label: `Grade ${i + 1}` })),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Students - OSMS</title>
      </Head>

      {/* Header */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Students', path: '/students' },
          ]}
        />
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Students
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage all students in your school
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={FiDownload}>
              Export
            </Button>
            <Link href="/students/add">
              <Button icon={FiPlus}>
                Add Student
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={FiSearch}
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select
                options={classOptions}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-40"
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

      {/* Students Table */}
      <Card>
        <Table
          columns={columns}
          data={students}
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectRow={(id) => {
            setSelectedRows((prev) =>
              prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id]
            );
          }}
          onSelectAll={(checked) => {
            setSelectedRows(checked ? students.map((s) => s.id) : []);
          }}
          emptyMessage="No students found"
        />
        <Table.Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalStudents}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, student: null })}
        title="Delete Student"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {deleteModal.student?.firstName} {deleteModal.student?.lastName}
          </span>
          ? This action cannot be undone.
        </p>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, student: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteStudent}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default StudentsPage;
