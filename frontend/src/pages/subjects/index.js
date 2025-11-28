import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiBook,
  FiUsers,
  FiUser,
  FiClock,
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
  Textarea,
} from '../../components/ui';

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    creditHours: '',
  });

  // Mock subjects data
  const mockSubjects = [
    {
      id: '1',
      name: 'Mathematics',
      code: 'MATH101',
      category: 'Science',
      description: 'Basic mathematics including algebra, geometry, and calculus',
      creditHours: 4,
      classes: ['Class 9-A', 'Class 9-B', 'Class 10-A', 'Class 10-B'],
      teachers: [
        { name: 'John Smith', classes: 2 },
        { name: 'Sarah Wilson', classes: 2 },
      ],
      status: 'active',
    },
    {
      id: '2',
      name: 'English',
      code: 'ENG101',
      category: 'Languages',
      description: 'English language and literature',
      creditHours: 3,
      classes: ['Class 9-A', 'Class 9-B', 'Class 10-A', 'Class 10-B', 'Class 11-A'],
      teachers: [
        { name: 'Emily Davis', classes: 3 },
        { name: 'Michael Brown', classes: 2 },
      ],
      status: 'active',
    },
    {
      id: '3',
      name: 'Physics',
      code: 'PHY101',
      category: 'Science',
      description: 'Introduction to physics concepts and theories',
      creditHours: 4,
      classes: ['Class 11-A', 'Class 11-B', 'Class 12-A'],
      teachers: [{ name: 'Robert Johnson', classes: 3 }],
      status: 'active',
    },
    {
      id: '4',
      name: 'Chemistry',
      code: 'CHEM101',
      category: 'Science',
      description: 'Fundamentals of chemistry',
      creditHours: 4,
      classes: ['Class 11-A', 'Class 11-B', 'Class 12-A', 'Class 12-B'],
      teachers: [
        { name: 'Anna Williams', classes: 2 },
        { name: 'David Lee', classes: 2 },
      ],
      status: 'active',
    },
    {
      id: '5',
      name: 'History',
      code: 'HIST101',
      category: 'Humanities',
      description: 'World history and civilizations',
      creditHours: 3,
      classes: ['Class 9-A', 'Class 9-B', 'Class 10-A'],
      teachers: [{ name: 'James Anderson', classes: 3 }],
      status: 'active',
    },
    {
      id: '6',
      name: 'Computer Science',
      code: 'CS101',
      category: 'Technology',
      description: 'Introduction to programming and computer fundamentals',
      creditHours: 3,
      classes: ['Class 10-A', 'Class 11-A', 'Class 12-A'],
      teachers: [{ name: 'Lisa Chen', classes: 3 }],
      status: 'active',
    },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'science', label: 'Science' },
    { value: 'languages', label: 'Languages' },
    { value: 'humanities', label: 'Humanities' },
    { value: 'technology', label: 'Technology' },
    { value: 'arts', label: 'Arts' },
    { value: 'sports', label: 'Sports' },
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubjects(mockSubjects);
      setTotalPages(2);
      setLoading(false);
    };

    fetchSubjects();
  }, [currentPage, searchQuery, selectedCategory]);

  const getCategoryBadge = (category) => {
    const colors = {
      Science: 'primary',
      Languages: 'success',
      Humanities: 'warning',
      Technology: 'secondary',
      Arts: 'error',
      Sports: 'primary',
    };
    return <Badge variant={colors[category] || 'secondary'}>{category}</Badge>;
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setIsEditing(true);
      setSelectedSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        category: subject.category.toLowerCase(),
        description: subject.description,
        creditHours: subject.creditHours.toString(),
      });
    } else {
      setIsEditing(false);
      setSelectedSubject(null);
      setFormData({
        name: '',
        code: '',
        category: '',
        description: '',
        creditHours: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    // Handle save logic
    setShowModal(false);
    setSelectedSubject(null);
  };

  const handleDelete = () => {
    // Handle delete logic
    setShowDeleteModal(false);
    setSelectedSubject(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Subject',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <FiBook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => getCategoryBadge(row.category),
    },
    {
      key: 'creditHours',
      label: 'Credit Hours',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiClock className="w-4 h-4 text-gray-400" />
          <span>{row.creditHours} hours</span>
        </div>
      ),
    },
    {
      key: 'classes',
      label: 'Classes',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span>{row.classes.length} classes</span>
        </div>
      ),
    },
    {
      key: 'teachers',
      label: 'Teachers',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiUser className="w-4 h-4 text-gray-400" />
          <span>{row.teachers.length} teachers</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/subjects/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedSubject(row);
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
        <title>Subjects | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subjects
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage academic subjects
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiDownload}>
              Export
            </Button>
            <Button
              variant="primary"
              icon={FiPlus}
              onClick={() => handleOpenModal()}
            >
              Add Subject
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiBook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">48</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiUser className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teachers Assigned</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">42</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Credit Hours</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">3.5</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                options={categories}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </Card>

        {/* Subjects Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : subjects.length === 0 ? (
            <EmptyState
              icon={FiBook}
              title="No subjects found"
              description="Get started by adding your first subject"
              action={
                <Button
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => handleOpenModal()}
                >
                  Add Subject
                </Button>
              }
            />
          ) : (
            <>
              <Table columns={columns} data={subjects} />
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Subject' : 'Add New Subject'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subject Name"
              placeholder="Enter subject name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Subject Code"
              placeholder="Enter subject code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categories.filter((c) => c.value)}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Credit Hours"
              type="number"
              placeholder="Enter credit hours"
              value={formData.creditHours}
              onChange={(e) => setFormData({ ...formData, creditHours: e.target.value })}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Enter subject description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {isEditing ? 'Update' : 'Add'} Subject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Subject"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{selectedSubject?.name}&quot;? This will also
            remove all associated teacher assignments and class schedules.
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
