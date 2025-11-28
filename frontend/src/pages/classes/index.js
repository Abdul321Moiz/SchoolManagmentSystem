import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiPlus, FiSearch, FiDownload, FiMoreVertical,
  FiEdit2, FiTrash2, FiEye, FiUsers,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import {
  Card, Button, Input, Table, Badge, Avatar, Dropdown, Modal,
} from '@/components/ui';

const ClassesPage = () => {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ open: false, classItem: null });

  useEffect(() => {
    fetchClasses();
  }, [currentPage, pageSize, searchTerm]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockClasses = Array.from({ length: 12 }, (_, i) => ({
        id: `CLS${String(i + 1).padStart(4, '0')}`,
        name: `Grade ${i + 1}`,
        sections: [
          { name: 'A', students: Math.floor(Math.random() * 20) + 20 },
          { name: 'B', students: Math.floor(Math.random() * 20) + 20 },
          { name: 'C', students: Math.floor(Math.random() * 20) + 15 },
        ],
        classTeacher: {
          name: ['Robert Anderson', 'Lisa Taylor', 'Mark Thomas', 'Jennifer Jackson', 'David White', 'Amanda Harris', 'Christopher Martin', 'Michelle Thompson', 'Daniel Garcia', 'Jessica Martinez', 'Kevin Brown', 'Sarah Wilson'][i],
        },
        totalStudents: 0,
        subjects: Math.floor(Math.random() * 4) + 5,
        schedule: `${8 + Math.floor(i / 4)}:00 AM - ${1 + Math.floor(i / 4)}:00 PM`,
        status: 'active',
      }));

      // Calculate total students
      mockClasses.forEach((cls) => {
        cls.totalStudents = cls.sections.reduce((sum, sec) => sum + sec.students, 0);
      });

      setClasses(mockClasses);
      setTotalPages(1);
      setTotalClasses(12);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      toast.success('Class deleted successfully');
      setDeleteModal({ open: false, classItem: null });
      fetchClasses();
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Class Name',
      sortable: true,
      render: (value, cls) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{cls.id}</p>
        </div>
      ),
    },
    {
      key: 'sections',
      header: 'Sections',
      render: (value) => (
        <div className="flex gap-1">
          {value.map((section) => (
            <Badge key={section.name} variant="primary" size="sm">
              {section.name} ({section.students})
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'totalStudents',
      header: 'Total Students',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{value}</span>
        </div>
      ),
    },
    {
      key: 'classTeacher',
      header: 'Class Teacher',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Avatar name={value.name} size="xs" />
          <span className="text-gray-700 dark:text-gray-300">{value.name}</span>
        </div>
      ),
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">{value} subjects</span>
      ),
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
      render: (_, classItem) => (
        <Dropdown
          align="right"
          trigger={
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          }
        >
          <Dropdown.Item icon={FiEye} onClick={() => router.push(`/classes/${classItem.id}`)}>
            View Details
          </Dropdown.Item>
          <Dropdown.Item icon={FiEdit2} onClick={() => router.push(`/classes/${classItem.id}/edit`)}>
            Edit
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={FiTrash2} danger onClick={() => setDeleteModal({ open: true, classItem })}>
            Delete
          </Dropdown.Item>
        </Dropdown>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Classes - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Classes', path: '/classes' },
          ]}
        />
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Classes
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage classes and sections
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={FiDownload}>
              Export
            </Button>
            <Link href="/classes/add">
              <Button icon={FiPlus}>
                Add Class
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <Card.Content>
          <Input
            icon={FiSearch}
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </Card.Content>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={classes}
          loading={loading}
          emptyMessage="No classes found"
        />
        <Table.Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalClasses}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, classItem: null })}
        title="Delete Class"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {deleteModal.classItem?.name}
          </span>
          ? This will also remove all sections and associated data.
        </p>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, classItem: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteClass}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default ClassesPage;
