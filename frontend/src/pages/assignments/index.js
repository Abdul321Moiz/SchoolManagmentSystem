import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiClock,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  Table,
  Pagination,
  EmptyState,
  Spinner,
} from '../../components/ui';

export default function AssignmentsPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Mock data
  const mockAssignments = [
    {
      id: '1',
      title: 'Mathematics Problem Set',
      description: 'Solve problems from chapter 5',
      class: { name: 'Class 10', section: 'A' },
      subject: 'Mathematics',
      teacher: { name: 'John Smith' },
      dueDate: '2024-01-25',
      createdAt: '2024-01-15',
      totalMarks: 50,
      submissions: 28,
      totalStudents: 35,
      status: 'active',
      attachments: 2,
    },
    {
      id: '2',
      title: 'English Essay Writing',
      description: 'Write an essay on climate change',
      class: { name: 'Class 10', section: 'B' },
      subject: 'English',
      teacher: { name: 'Sarah Johnson' },
      dueDate: '2024-01-20',
      createdAt: '2024-01-10',
      totalMarks: 100,
      submissions: 32,
      totalStudents: 32,
      status: 'completed',
      attachments: 1,
    },
    {
      id: '3',
      title: 'Science Lab Report',
      description: 'Submit lab report for chemistry experiment',
      class: { name: 'Class 9', section: 'A' },
      subject: 'Science',
      teacher: { name: 'Michael Brown' },
      dueDate: '2024-01-28',
      createdAt: '2024-01-18',
      totalMarks: 40,
      submissions: 15,
      totalStudents: 30,
      status: 'active',
      attachments: 3,
    },
    {
      id: '4',
      title: 'History Research Paper',
      description: 'Research paper on World War II',
      class: { name: 'Class 11', section: 'A' },
      subject: 'History',
      teacher: { name: 'Emily Davis' },
      dueDate: '2024-02-05',
      createdAt: '2024-01-20',
      totalMarks: 75,
      submissions: 5,
      totalStudents: 28,
      status: 'draft',
      attachments: 0,
    },
    {
      id: '5',
      title: 'Physics Numericals',
      description: 'Solve numericals from motion chapter',
      class: { name: 'Class 12', section: 'A' },
      subject: 'Physics',
      teacher: { name: 'Robert Wilson' },
      dueDate: '2024-01-22',
      createdAt: '2024-01-12',
      totalMarks: 60,
      submissions: 25,
      totalStudents: 25,
      status: 'completed',
      attachments: 1,
    },
  ];

  const classes = [
    { value: '', label: 'All Classes' },
    { value: 'class-9', label: 'Class 9' },
    { value: 'class-10', label: 'Class 10' },
    { value: 'class-11', label: 'Class 11' },
    { value: 'class-12', label: 'Class 12' },
  ];

  const subjects = [
    { value: '', label: 'All Subjects' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'english', label: 'English' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'physics', label: 'Physics' },
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchAssignments = async () => {
      setLoading(true);
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAssignments(mockAssignments);
      setTotalPages(3);
      setLoading(false);
    };

    fetchAssignments();
  }, [currentPage, searchQuery, selectedClass, selectedSubject, selectedStatus]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { variant: 'warning', label: 'Draft' },
      active: { variant: 'primary', label: 'Active' },
      completed: { variant: 'success', label: 'Completed' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSubmissionProgress = (submissions, total) => {
    const percentage = (submissions / total) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              percentage === 100
                ? 'bg-green-500'
                : percentage >= 50
                ? 'bg-blue-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {submissions}/{total}
        </span>
      </div>
    );
  };

  const handleDelete = () => {
    // Handle delete logic
    setShowDeleteModal(false);
    setSelectedAssignment(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const columns = [
    {
      key: 'title',
      label: 'Assignment',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.description}</p>
          {row.attachments > 0 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <FiFileText className="w-3 h-3" />
              {row.attachments} attachment{row.attachments > 1 ? 's' : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (row) => (
        <span className="text-gray-900 dark:text-white">
          {row.class.name}-{row.class.section}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          <span className={isOverdue(row.dueDate) && row.status !== 'completed' ? 'text-red-600' : ''}>
            {formatDate(row.dueDate)}
          </span>
          {isOverdue(row.dueDate) && row.status !== 'completed' && (
            <FiAlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'submissions',
      label: 'Submissions',
      render: (row) => getSubmissionProgress(row.submissions, row.totalStudents),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/assignments/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/assignments/${row.id}/edit`)}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedAssignment(row);
              setShowDeleteModal(true);
            }}
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Assignments | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assignments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track assignments
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiDownload}>
              Export
            </Button>
            <Button
              variant="primary"
              icon={FiPlus}
              onClick={() => router.push('/assignments/add')}
            >
              Create Assignment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiFileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">4</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                options={classes}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full sm:w-40"
              />
              <Select
                options={subjects}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-40"
              />
              <Select
                options={statuses}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-36"
              />
            </div>
          </div>
        </Card>

        {/* Assignments Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={FiFileText}
              title="No assignments found"
              description="Get started by creating your first assignment"
              action={
                <Button
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => router.push('/assignments/add')}
                >
                  Create Assignment
                </Button>
              }
            />
          ) : (
            <>
              <Table columns={columns} data={assignments} />
              <div className="p-4 border-t dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Assignment"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{selectedAssignment?.title}&quot;? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
