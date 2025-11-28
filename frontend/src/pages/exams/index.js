import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiPlus, FiSearch, FiMoreVertical,
  FiEdit2, FiTrash2, FiEye, FiCalendar, FiClock,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import {
  Card, Button, Input, Select, Table, Badge, Dropdown, Modal,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';

const ExamsPage = () => {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExams, setTotalExams] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ open: false, exam: null });

  useEffect(() => {
    fetchExams();
  }, [currentPage, pageSize, selectedType, searchTerm]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockExams = [
        {
          id: 'EXM001',
          name: 'Mid-Term Examination',
          type: 'midterm',
          startDate: new Date(2024, 1, 20),
          endDate: new Date(2024, 1, 28),
          classes: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
          subjects: 5,
          status: 'upcoming',
        },
        {
          id: 'EXM002',
          name: 'Unit Test 1',
          type: 'unit_test',
          startDate: new Date(2024, 0, 15),
          endDate: new Date(2024, 0, 17),
          classes: ['Grade 6', 'Grade 7', 'Grade 8'],
          subjects: 4,
          status: 'completed',
        },
        {
          id: 'EXM003',
          name: 'Final Examination',
          type: 'final',
          startDate: new Date(2024, 3, 1),
          endDate: new Date(2024, 3, 15),
          classes: ['All Grades'],
          subjects: 8,
          status: 'scheduled',
        },
        {
          id: 'EXM004',
          name: 'Quarterly Assessment',
          type: 'quarterly',
          startDate: new Date(2024, 2, 10),
          endDate: new Date(2024, 2, 15),
          classes: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
          subjects: 6,
          status: 'scheduled',
        },
      ];

      setExams(mockExams);
      setTotalPages(1);
      setTotalExams(4);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    try {
      toast.success('Exam deleted successfully');
      setDeleteModal({ open: false, exam: null });
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      upcoming: 'warning',
      scheduled: 'primary',
      ongoing: 'success',
      completed: 'gray',
    };
    return <Badge variant={variants[status]} size="sm">{status}</Badge>;
  };

  const columns = [
    {
      key: 'name',
      header: 'Exam Name',
      sortable: true,
      render: (value, exam) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{exam.id}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <Badge variant="gray" size="sm">
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'dates',
      header: 'Duration',
      render: (_, exam) => (
        <div className="text-sm">
          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <FiCalendar className="w-3.5 h-3.5" />
            {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
          </p>
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Classes',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((cls, i) => (
            <Badge key={i} variant="gray" size="sm">{cls}</Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="gray" size="sm">+{value.length - 2}</Badge>
          )}
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
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'actions',
      header: '',
      render: (_, exam) => (
        <Dropdown
          align="right"
          trigger={
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          }
        >
          <Dropdown.Item icon={FiEye} onClick={() => router.push(`/exams/${exam.id}`)}>
            View Details
          </Dropdown.Item>
          <Dropdown.Item icon={FiEdit2} onClick={() => router.push(`/exams/${exam.id}/edit`)}>
            Edit
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={FiTrash2} danger onClick={() => setDeleteModal({ open: true, exam })}>
            Delete
          </Dropdown.Item>
        </Dropdown>
      ),
    },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'unit_test', label: 'Unit Test' },
    { value: 'midterm', label: 'Mid-Term' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'final', label: 'Final' },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Examinations - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Examinations', path: '/exams' },
          ]}
        />
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Examinations
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage exams and assessments
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/results">
              <Button variant="outline">
                View Results
              </Button>
            </Link>
            <Link href="/exams/create">
              <Button icon={FiPlus}>
                Create Exam
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
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              options={typeOptions}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-48"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={exams}
          loading={loading}
          emptyMessage="No exams found"
        />
        <Table.Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalExams}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, exam: null })}
        title="Delete Exam"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {deleteModal.exam?.name}
          </span>
          ? This will also remove all associated results and data.
        </p>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, exam: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteExam}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default ExamsPage;
