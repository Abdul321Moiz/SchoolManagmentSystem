import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiEdit2,
  FiEye,
  FiAward,
  FiUser,
  FiCalendar,
  FiPrinter,
  FiMail,
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

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Mock results data
  const mockResults = [
    {
      id: '1',
      student: {
        name: 'John Smith',
        rollNo: '101',
        class: 'Class 10-A',
        avatar: null,
      },
      exam: 'Mid-Term Exam 2024',
      subjects: [
        { name: 'Mathematics', marks: 85, maxMarks: 100, grade: 'A' },
        { name: 'English', marks: 78, maxMarks: 100, grade: 'B+' },
        { name: 'Science', marks: 92, maxMarks: 100, grade: 'A+' },
        { name: 'History', marks: 75, maxMarks: 100, grade: 'B' },
        { name: 'Geography', marks: 80, maxMarks: 100, grade: 'A-' },
      ],
      totalMarks: 410,
      maxTotalMarks: 500,
      percentage: 82,
      rank: 5,
      grade: 'A',
      status: 'published',
    },
    {
      id: '2',
      student: {
        name: 'Emma Johnson',
        rollNo: '102',
        class: 'Class 10-A',
        avatar: null,
      },
      exam: 'Mid-Term Exam 2024',
      subjects: [
        { name: 'Mathematics', marks: 95, maxMarks: 100, grade: 'A+' },
        { name: 'English', marks: 88, maxMarks: 100, grade: 'A' },
        { name: 'Science', marks: 90, maxMarks: 100, grade: 'A+' },
        { name: 'History', marks: 85, maxMarks: 100, grade: 'A' },
        { name: 'Geography', marks: 92, maxMarks: 100, grade: 'A+' },
      ],
      totalMarks: 450,
      maxTotalMarks: 500,
      percentage: 90,
      rank: 1,
      grade: 'A+',
      status: 'published',
    },
    {
      id: '3',
      student: {
        name: 'Michael Brown',
        rollNo: '103',
        class: 'Class 10-A',
        avatar: null,
      },
      exam: 'Mid-Term Exam 2024',
      subjects: [
        { name: 'Mathematics', marks: 72, maxMarks: 100, grade: 'B' },
        { name: 'English', marks: 65, maxMarks: 100, grade: 'C+' },
        { name: 'Science', marks: 78, maxMarks: 100, grade: 'B+' },
        { name: 'History', marks: 70, maxMarks: 100, grade: 'B' },
        { name: 'Geography', marks: 68, maxMarks: 100, grade: 'C+' },
      ],
      totalMarks: 353,
      maxTotalMarks: 500,
      percentage: 70.6,
      rank: 12,
      grade: 'B',
      status: 'draft',
    },
    {
      id: '4',
      student: {
        name: 'Sophia Davis',
        rollNo: '104',
        class: 'Class 10-A',
        avatar: null,
      },
      exam: 'Mid-Term Exam 2024',
      subjects: [
        { name: 'Mathematics', marks: 88, maxMarks: 100, grade: 'A' },
        { name: 'English', marks: 92, maxMarks: 100, grade: 'A+' },
        { name: 'Science', marks: 85, maxMarks: 100, grade: 'A' },
        { name: 'History', marks: 90, maxMarks: 100, grade: 'A+' },
        { name: 'Geography', marks: 87, maxMarks: 100, grade: 'A' },
      ],
      totalMarks: 442,
      maxTotalMarks: 500,
      percentage: 88.4,
      rank: 2,
      grade: 'A',
      status: 'published',
    },
    {
      id: '5',
      student: {
        name: 'James Wilson',
        rollNo: '105',
        class: 'Class 10-A',
        avatar: null,
      },
      exam: 'Mid-Term Exam 2024',
      subjects: [
        { name: 'Mathematics', marks: 55, maxMarks: 100, grade: 'C' },
        { name: 'English', marks: 60, maxMarks: 100, grade: 'C' },
        { name: 'Science', marks: 58, maxMarks: 100, grade: 'C' },
        { name: 'History', marks: 62, maxMarks: 100, grade: 'C+' },
        { name: 'Geography', marks: 65, maxMarks: 100, grade: 'C+' },
      ],
      totalMarks: 300,
      maxTotalMarks: 500,
      percentage: 60,
      rank: 25,
      grade: 'C',
      status: 'draft',
    },
  ];

  const classes = [
    { value: '', label: 'All Classes' },
    { value: 'class-9', label: 'Class 9' },
    { value: 'class-10', label: 'Class 10' },
    { value: 'class-11', label: 'Class 11' },
    { value: 'class-12', label: 'Class 12' },
  ];

  const exams = [
    { value: '', label: 'All Exams' },
    { value: 'midterm-2024', label: 'Mid-Term Exam 2024' },
    { value: 'quarterly-2023', label: 'Quarterly Exam 2023' },
    { value: 'annual-2023', label: 'Annual Exam 2023' },
  ];

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setResults(mockResults);
      setTotalPages(3);
      setLoading(false);
    };

    fetchResults();
  }, [currentPage, searchQuery, selectedClass, selectedExam]);

  const getGradeBadge = (grade) => {
    const colors = {
      'A+': 'success',
      'A': 'success',
      'A-': 'success',
      'B+': 'primary',
      'B': 'primary',
      'B-': 'primary',
      'C+': 'warning',
      'C': 'warning',
      'C-': 'warning',
      'D': 'error',
      'F': 'error',
    };
    return <Badge variant={colors[grade] || 'secondary'}>{grade}</Badge>;
  };

  const getStatusBadge = (status) => {
    const config = {
      published: { variant: 'success', label: 'Published', icon: FiCheckCircle },
      draft: { variant: 'warning', label: 'Draft', icon: FiAlertCircle },
    };
    const c = config[status] || config.draft;
    return (
      <Badge variant={c.variant}>
        <c.icon className="w-3 h-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  const handlePublish = () => {
    setShowPublishModal(false);
    setSelectedResult(null);
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.student.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Roll No: {row.student.rollNo} • {row.student.class}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'exam',
      label: 'Exam',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          <span>{row.exam}</span>
        </div>
      ),
    },
    {
      key: 'totalMarks',
      label: 'Marks',
      render: (row) => (
        <div className="text-center">
          <p className="font-medium text-gray-900 dark:text-white">
            {row.totalMarks}/{row.maxTotalMarks}
          </p>
        </div>
      ),
    },
    {
      key: 'percentage',
      label: 'Percentage',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.percentage >= 80
                  ? 'bg-green-500'
                  : row.percentage >= 60
                  ? 'bg-blue-500'
                  : row.percentage >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${row.percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium">{row.percentage.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: 'rank',
      label: 'Rank',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiAward className={`w-4 h-4 ${row.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className="font-medium">#{row.rank}</span>
        </div>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (row) => getGradeBadge(row.grade),
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
            onClick={() => router.push(`/results/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/results/${row.id}/edit`)}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* Handle print */}}
            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
            title="Print Report Card"
          >
            <FiPrinter className="w-4 h-4" />
          </button>
          {row.status === 'draft' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setSelectedResult(row);
                setShowPublishModal(true);
              }}
            >
              Publish
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Results | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Exam Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage student results
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiDownload}>
              Export
            </Button>
            <Button variant="secondary" icon={FiMail}>
              Send Report Cards
            </Button>
            <Button
              variant="primary"
              icon={FiPlus}
              onClick={() => router.push('/results/add')}
            >
              Add Results
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1,250</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">89%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiAward className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Distinction</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">42%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">125</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search students..."
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
                options={exams}
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </div>
        </Card>

        {/* Results Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={FiAward}
              title="No results found"
              description="Get started by adding exam results"
              action={
                <Button
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => router.push('/results/add')}
                >
                  Add Results
                </Button>
              }
            />
          ) : (
            <>
              <Table columns={columns} data={results} />
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

      {/* Publish Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Publish Result"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to publish the result for{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedResult?.student.name}
            </span>
            ? This will make the result visible to the student and their parents.
          </p>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedResult?.totalMarks}/{selectedResult?.maxTotalMarks}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedResult?.percentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedResult?.grade}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rank</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  #{selectedResult?.rank}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePublish}>
              Publish Result
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
