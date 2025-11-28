import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import {
  FiPlus,
  FiSearch,
  FiBell,
  FiMail,
  FiMessageSquare,
  FiUsers,
  FiCalendar,
  FiClock,
  FiEye,
  FiTrash2,
  FiSend,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
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
  Tabs,
  Textarea,
  Checkbox,
} from '../../components/ui';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Mock notifications data
  const mockNotifications = [
    {
      id: '1',
      title: 'Fee Payment Reminder',
      message: 'Reminder: Second quarter fees are due by January 31st. Please ensure timely payment to avoid late fees.',
      type: 'fee',
      priority: 'high',
      recipients: { type: 'All Parents', count: 450 },
      sender: { name: 'Admin', role: 'School Admin' },
      sentAt: '2024-01-20T10:30:00',
      read: 320,
      delivered: 448,
      status: 'sent',
    },
    {
      id: '2',
      title: 'Parent-Teacher Meeting',
      message: 'Dear Parents, We are organizing a Parent-Teacher meeting on February 5th. Your presence is requested.',
      type: 'event',
      priority: 'medium',
      recipients: { type: 'Class 10 Parents', count: 120 },
      sender: { name: 'Principal', role: 'School Admin' },
      sentAt: '2024-01-18T14:00:00',
      read: 95,
      delivered: 118,
      status: 'sent',
    },
    {
      id: '3',
      title: 'Exam Schedule Published',
      message: 'The annual examination schedule for academic year 2024 has been published. Please check the notice board.',
      type: 'academic',
      priority: 'high',
      recipients: { type: 'All Students', count: 850 },
      sender: { name: 'Exam Coordinator', role: 'Teacher' },
      sentAt: '2024-01-15T09:00:00',
      read: 750,
      delivered: 845,
      status: 'sent',
    },
    {
      id: '4',
      title: 'School Holiday Notice',
      message: 'School will remain closed on January 26th on account of Republic Day.',
      type: 'announcement',
      priority: 'low',
      recipients: { type: 'Everyone', count: 1500 },
      sender: { name: 'Admin', role: 'School Admin' },
      sentAt: '2024-01-12T16:30:00',
      read: 1200,
      delivered: 1495,
      status: 'sent',
    },
    {
      id: '5',
      title: 'Sports Day Registration',
      message: 'Registration for Annual Sports Day is now open. Students interested in participating should register by January 25th.',
      type: 'event',
      priority: 'medium',
      recipients: { type: 'All Students', count: 850 },
      sender: { name: 'Sports Teacher', role: 'Teacher' },
      sentAt: '2024-01-10T11:00:00',
      read: 680,
      delivered: 850,
      status: 'sent',
    },
    {
      id: '6',
      title: 'New Assignment Posted',
      message: 'A new Mathematics assignment has been posted for Class 10. Due date: January 28th.',
      type: 'academic',
      priority: 'medium',
      recipients: { type: 'Class 10 Students', count: 120 },
      sender: { name: 'John Smith', role: 'Teacher' },
      sentAt: '2024-01-08T10:00:00',
      read: 110,
      delivered: 120,
      status: 'sent',
    },
  ];

  const types = [
    { value: '', label: 'All Types' },
    { value: 'fee', label: 'Fee Related' },
    { value: 'academic', label: 'Academic' },
    { value: 'event', label: 'Events' },
    { value: 'announcement', label: 'Announcements' },
  ];

  const tabs = [
    { id: 'all', label: 'All Notifications', icon: FiBell },
    { id: 'sent', label: 'Sent', icon: FiSend },
    { id: 'scheduled', label: 'Scheduled', icon: FiClock },
    { id: 'drafts', label: 'Drafts', icon: FiMessageSquare },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNotifications(mockNotifications);
      setTotalPages(3);
      setLoading(false);
    };

    fetchNotifications();
  }, [currentPage, searchQuery, selectedType, activeTab]);

  const getTypeBadge = (type) => {
    const config = {
      fee: { variant: 'warning', label: 'Fee', icon: FiAlertCircle },
      academic: { variant: 'primary', label: 'Academic', icon: FiInfo },
      event: { variant: 'success', label: 'Event', icon: FiCalendar },
      announcement: { variant: 'secondary', label: 'Announcement', icon: FiBell },
    };
    const c = config[type] || config.announcement;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { variant: 'error', label: 'High' },
      medium: { variant: 'warning', label: 'Medium' },
      low: { variant: 'secondary', label: 'Low' },
    };
    const c = config[priority] || config.low;
    return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeliveryRate = (delivered, total) => {
    return ((delivered / total) * 100).toFixed(1);
  };

  const getReadRate = (read, delivered) => {
    return ((read / delivered) * 100).toFixed(1);
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    setSelectedNotification(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(notifications.map(n => n.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const columns = [
    {
      key: 'select',
      label: (
        <Checkbox
          checked={selectedItems.length === notifications.length && notifications.length > 0}
          onChange={handleSelectAll}
        />
      ),
      render: (row) => (
        <Checkbox
          checked={selectedItems.includes(row.id)}
          onChange={() => handleSelectItem(row.id)}
        />
      ),
    },
    {
      key: 'title',
      label: 'Notification',
      render: (row) => (
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900 dark:text-white">{row.title}</p>
            {getPriorityBadge(row.priority)}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{row.message}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => getTypeBadge(row.type),
    },
    {
      key: 'recipients',
      label: 'Recipients',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-900 dark:text-white">{row.recipients.type}</p>
            <p className="text-sm text-gray-500">{row.recipients.count} recipients</p>
          </div>
        </div>
      ),
    },
    {
      key: 'delivery',
      label: 'Delivery',
      render: (row) => (
        <div className="text-center">
          <p className="font-medium text-gray-900 dark:text-white">
            {getDeliveryRate(row.delivered, row.recipients.count)}%
          </p>
          <p className="text-xs text-gray-500">{row.delivered} delivered</p>
        </div>
      ),
    },
    {
      key: 'read',
      label: 'Read',
      render: (row) => (
        <div className="text-center">
          <p className="font-medium text-gray-900 dark:text-white">
            {getReadRate(row.read, row.delivered)}%
          </p>
          <p className="text-xs text-gray-500">{row.read} read</p>
        </div>
      ),
    },
    {
      key: 'sentAt',
      label: 'Sent At',
      render: (row) => (
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <FiClock className="w-4 h-4" />
          <span className="text-sm">{formatDateTime(row.sentAt)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/notifications/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedNotification(row);
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
        <title>Notifications | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Send and manage notifications
            </p>
          </div>
          <div className="flex gap-3">
            {selectedItems.length > 0 && (
              <Button
                variant="danger"
                icon={FiTrash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete ({selectedItems.length})
              </Button>
            )}
            <Button
              variant="primary"
              icon={FiPlus}
              onClick={() => setShowComposeModal(true)}
            >
              Compose
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiSend className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">156</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">98.5%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiEye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Read Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">82.3%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">5</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                options={types}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </Card>

        {/* Notifications Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={FiBell}
              title="No notifications found"
              description="Get started by composing your first notification"
              action={
                <Button
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => setShowComposeModal(true)}
                >
                  Compose
                </Button>
              }
            />
          ) : (
            <>
              <Table columns={columns} data={notifications} />
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

      {/* Compose Modal */}
      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        title="Compose Notification"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Enter notification title"
          />
          <Select
            label="Type"
            options={[
              { value: 'announcement', label: 'Announcement' },
              { value: 'academic', label: 'Academic' },
              { value: 'event', label: 'Event' },
              { value: 'fee', label: 'Fee Related' },
            ]}
          />
          <Select
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <Select
            label="Recipients"
            options={[
              { value: 'everyone', label: 'Everyone' },
              { value: 'students', label: 'All Students' },
              { value: 'teachers', label: 'All Teachers' },
              { value: 'parents', label: 'All Parents' },
              { value: 'class', label: 'Specific Class' },
            ]}
          />
          <Textarea
            label="Message"
            placeholder="Enter notification message"
            rows={4}
          />
          <div className="flex items-center gap-4">
            <Checkbox label="Send via Email" />
            <Checkbox label="Send via SMS" />
            <Checkbox label="Push Notification" defaultChecked />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowComposeModal(false)}>
              Save as Draft
            </Button>
            <Button variant="primary" icon={FiSend}>
              Send Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Notification"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {selectedItems.length > 1
              ? `Are you sure you want to delete ${selectedItems.length} notifications?`
              : `Are you sure you want to delete "${selectedNotification?.title}"?`
            } This action cannot be undone.
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
