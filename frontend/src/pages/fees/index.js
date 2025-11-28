import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiPlus, FiSearch, FiDownload, FiMoreVertical,
  FiEdit2, FiTrash2, FiEye, FiDollarSign, FiCheck, FiClock,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import {
  Card, Button, Input, Select, Table, Badge, Dropdown, Modal, Avatar,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';

const FeesPage = () => {
  const router = useRouter();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFees, setTotalFees] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ open: false, fee: null });

  useEffect(() => {
    fetchFees();
  }, [currentPage, pageSize, selectedStatus, searchTerm]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockFees = Array.from({ length: 10 }, (_, i) => ({
        id: `INV${String(i + 1).padStart(4, '0')}`,
        student: {
          id: `STU${String(i + 1).padStart(4, '0')}`,
          name: ['John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown', 'Emily Jones', 'James Garcia', 'Emma Miller', 'William Davis', 'Olivia Wilson'][i],
          class: `Grade ${Math.floor(Math.random() * 12) + 1}`,
        },
        type: ['Tuition Fee', 'Exam Fee', 'Transport Fee', 'Library Fee', 'Lab Fee'][Math.floor(Math.random() * 5)],
        amount: Math.floor(Math.random() * 5000) + 1000,
        dueDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: ['paid', 'paid', 'pending', 'paid', 'overdue', 'paid', 'pending', 'paid', 'paid', 'partial'][i],
        paidAmount: 0,
      }));

      // Calculate paid amounts
      mockFees.forEach((fee) => {
        if (fee.status === 'paid') {
          fee.paidAmount = fee.amount;
        } else if (fee.status === 'partial') {
          fee.paidAmount = Math.floor(fee.amount * 0.5);
        }
      });

      setFees(mockFees);
      setTotalPages(3);
      setTotalFees(28);
    } catch (error) {
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFee = async () => {
    try {
      toast.success('Fee record deleted successfully');
      setDeleteModal({ open: false, fee: null });
      fetchFees();
    } catch (error) {
      toast.error('Failed to delete fee record');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      partial: 'primary',
    };
    return <Badge variant={variants[status]} size="sm">{status}</Badge>;
  };

  const columns = [
    {
      key: 'id',
      header: 'Invoice #',
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (value) => (
        <div className="flex items-center gap-3">
          <Avatar name={value.name} size="sm" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{value.class}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Fee Type',
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">{value}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      render: (value, fee) => (
        <span className={value > 0 ? 'text-success-600' : 'text-gray-500'}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'actions',
      header: '',
      render: (_, fee) => (
        <Dropdown
          align="right"
          trigger={
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          }
        >
          <Dropdown.Item icon={FiEye} onClick={() => router.push(`/fees/${fee.id}`)}>
            View Details
          </Dropdown.Item>
          {fee.status !== 'paid' && (
            <Dropdown.Item icon={FiDollarSign} onClick={() => router.push(`/fees/${fee.id}/pay`)}>
              Record Payment
            </Dropdown.Item>
          )}
          <Dropdown.Item icon={FiEdit2} onClick={() => router.push(`/fees/${fee.id}/edit`)}>
            Edit
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={FiTrash2} danger onClick={() => setDeleteModal({ open: true, fee })}>
            Delete
          </Dropdown.Item>
        </Dropdown>
      ),
    },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'partial', label: 'Partial' },
  ];

  // Calculate summary
  const summary = {
    total: fees.reduce((sum, f) => sum + f.amount, 0),
    collected: fees.reduce((sum, f) => sum + f.paidAmount, 0),
    pending: fees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0),
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Fees Management - OSMS</title>
      </Head>

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Fees', path: '/fees' },
          ]}
        />
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fees Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage student fees and payments
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={FiDownload}>
              Export
            </Button>
            <Link href="/fees/create">
              <Button icon={FiPlus}>
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.total)}
              </p>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Collected</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(summary.collected)}
              </p>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-warning-600">
                {formatCurrency(summary.pending)}
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card className="mb-6">
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={FiSearch}
                placeholder="Search by student name or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-48"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={fees}
          loading={loading}
          emptyMessage="No fee records found"
        />
        <Table.Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalFees}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, fee: null })}
        title="Delete Fee Record"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete invoice{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {deleteModal.fee?.id}
          </span>
          ? This action cannot be undone.
        </p>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, fee: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteFee}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default FeesPage;
