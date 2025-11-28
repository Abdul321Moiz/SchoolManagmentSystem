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
  FiUsers,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
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
  Avatar,
} from '../../components/ui';

export default function ParentsPage() {
  const router = useRouter();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  // Mock parents data
  const mockParents = [
    {
      id: '1',
      name: 'David Anderson',
      email: 'david.anderson@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Oak Street, Springfield, IL 62701',
      occupation: 'Software Engineer',
      children: [
        { name: 'Emma Anderson', class: 'Class 10-A', status: 'active' },
        { name: 'James Anderson', class: 'Class 7-B', status: 'active' },
      ],
      status: 'active',
      joinDate: '2022-08-15',
    },
    {
      id: '2',
      name: 'Sarah Williams',
      email: 'sarah.williams@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Maple Avenue, Springfield, IL 62702',
      occupation: 'Doctor',
      children: [
        { name: 'Michael Williams', class: 'Class 12-A', status: 'active' },
      ],
      status: 'active',
      joinDate: '2021-06-20',
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert.johnson@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Road, Springfield, IL 62703',
      occupation: 'Business Owner',
      children: [
        { name: 'Sophia Johnson', class: 'Class 9-A', status: 'active' },
        { name: 'Oliver Johnson', class: 'Class 5-C', status: 'active' },
        { name: 'Charlotte Johnson', class: 'Class 3-B', status: 'active' },
      ],
      status: 'active',
      joinDate: '2020-03-10',
    },
    {
      id: '4',
      name: 'Jennifer Brown',
      email: 'jennifer.brown@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Cedar Lane, Springfield, IL 62704',
      occupation: 'Teacher',
      children: [
        { name: 'Liam Brown', class: 'Class 11-B', status: 'active' },
      ],
      status: 'inactive',
      joinDate: '2019-09-01',
    },
    {
      id: '5',
      name: 'Michael Davis',
      email: 'michael.davis@email.com',
      phone: '+1 (555) 567-8901',
      address: '654 Birch Street, Springfield, IL 62705',
      occupation: 'Accountant',
      children: [
        { name: 'Ava Davis', class: 'Class 8-A', status: 'active' },
        { name: 'Noah Davis', class: 'Class 6-A', status: 'active' },
      ],
      status: 'active',
      joinDate: '2021-01-15',
    },
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setParents(mockParents);
      setTotalPages(3);
      setLoading(false);
    };

    fetchParents();
  }, [currentPage, searchQuery, selectedStatus]);

  const handleDelete = () => {
    setShowDeleteModal(false);
    setSelectedParent(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Parent',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="md" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{row.occupation}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row) => (
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiMail className="w-4 h-4" />
            {row.email}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiPhone className="w-4 h-4" />
            {row.phone}
          </p>
        </div>
      ),
    },
    {
      key: 'children',
      label: 'Children',
      render: (row) => (
        <div className="space-y-1">
          {row.children.map((child, index) => (
            <div key={index} className="flex items-center gap-2">
              <FiUser className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">{child.name}</span>
              <Badge variant="secondary" size="sm">{child.class}</Badge>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'childrenCount',
      label: 'Total',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span>{row.children.length} child{row.children.length > 1 ? 'ren' : ''}</span>
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
            onClick={() => router.push(`/parents/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/parents/${row.id}/edit`)}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedParent(row);
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
        <title>Parents | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Parents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage parent accounts and information
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiDownload}>
              Export
            </Button>
            <Button
              variant="primary"
              icon={FiPlus}
              onClick={() => router.push('/parents/add')}
            >
              Add Parent
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Parents</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">850</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiUser className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">820</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiMail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">With App Access</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">680</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiUsers className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Children</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1.8</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search parents by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                options={statuses}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-36"
              />
            </div>
          </div>
        </Card>

        {/* Parents Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : parents.length === 0 ? (
            <EmptyState
              icon={FiUsers}
              title="No parents found"
              description="Get started by adding your first parent"
              action={
                <Button
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => router.push('/parents/add')}
                >
                  Add Parent
                </Button>
              }
            />
          ) : (
            <>
              <Table columns={columns} data={parents} />
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
        title="Delete Parent"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{selectedParent?.name}&quot;? This will also
            remove their access to the parent portal.
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
