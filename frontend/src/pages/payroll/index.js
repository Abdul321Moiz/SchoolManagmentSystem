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
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiPrinter,
  FiCheckCircle,
  FiClock,
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
  Tabs,
} from '../../components/ui';

export default function PayrollPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('payroll');
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  // Mock payroll data
  const mockPayrolls = [
    {
      id: '1',
      employee: {
        name: 'John Smith',
        id: 'EMP-001',
        department: 'Mathematics',
        position: 'Senior Teacher',
        avatar: null,
      },
      month: 'January 2024',
      basicSalary: 5000,
      allowances: 800,
      deductions: 350,
      netSalary: 5450,
      paymentDate: '2024-01-31',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: '2',
      employee: {
        name: 'Sarah Johnson',
        id: 'EMP-002',
        department: 'English',
        position: 'Teacher',
        avatar: null,
      },
      month: 'January 2024',
      basicSalary: 4500,
      allowances: 600,
      deductions: 300,
      netSalary: 4800,
      paymentDate: null,
      status: 'pending',
      paymentMethod: null,
    },
    {
      id: '3',
      employee: {
        name: 'Michael Brown',
        id: 'EMP-003',
        department: 'Science',
        position: 'Head of Department',
        avatar: null,
      },
      month: 'January 2024',
      basicSalary: 6000,
      allowances: 1200,
      deductions: 450,
      netSalary: 6750,
      paymentDate: '2024-01-31',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: '4',
      employee: {
        name: 'Emily Davis',
        id: 'EMP-004',
        department: 'Administration',
        position: 'Administrative Staff',
        avatar: null,
      },
      month: 'January 2024',
      basicSalary: 3500,
      allowances: 400,
      deductions: 200,
      netSalary: 3700,
      paymentDate: null,
      status: 'processing',
      paymentMethod: null,
    },
    {
      id: '5',
      employee: {
        name: 'Robert Wilson',
        id: 'EMP-005',
        department: 'Physical Education',
        position: 'Sports Coach',
        avatar: null,
      },
      month: 'January 2024',
      basicSalary: 4000,
      allowances: 500,
      deductions: 250,
      netSalary: 4250,
      paymentDate: '2024-01-31',
      status: 'paid',
      paymentMethod: 'Check',
    },
  ];

  const months = [
    { value: '', label: 'All Months' },
    { value: 'january-2024', label: 'January 2024' },
    { value: 'december-2023', label: 'December 2023' },
    { value: 'november-2023', label: 'November 2023' },
    { value: 'october-2023', label: 'October 2023' },
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'paid', label: 'Paid' },
  ];

  const tabs = [
    { id: 'payroll', label: 'Payroll Records', icon: FiDollarSign },
    { id: 'structure', label: 'Salary Structure', icon: FiCalendar },
  ];

  useEffect(() => {
    const fetchPayrolls = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPayrolls(mockPayrolls);
      setTotalPages(3);
      setLoading(false);
    };

    fetchPayrolls();
  }, [currentPage, searchQuery, selectedMonth, selectedStatus, activeTab]);

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: 'warning', label: 'Pending', icon: FiClock },
      processing: { variant: 'primary', label: 'Processing', icon: FiAlertCircle },
      paid: { variant: 'success', label: 'Paid', icon: FiCheckCircle },
    };
    const c = config[status] || config.pending;
    return (
      <Badge variant={c.variant}>
        <c.icon className="w-3 h-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePay = () => {
    setShowPayModal(false);
    setSelectedPayroll(null);
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.employee.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.employee.id} • {row.employee.position}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => row.employee.department,
    },
    {
      key: 'month',
      label: 'Month',
    },
    {
      key: 'basicSalary',
      label: 'Basic Salary',
      render: (row) => formatCurrency(row.basicSalary),
    },
    {
      key: 'allowances',
      label: 'Allowances',
      render: (row) => (
        <span className="text-green-600">+{formatCurrency(row.allowances)}</span>
      ),
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (row) => (
        <span className="text-red-600">-{formatCurrency(row.deductions)}</span>
      ),
    },
    {
      key: 'netSalary',
      label: 'Net Salary',
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(row.netSalary)}
        </span>
      ),
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
            onClick={() => router.push(`/payroll/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* Handle print */}}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Print"
          >
            <FiPrinter className="w-4 h-4" />
          </button>
          {row.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setSelectedPayroll(row);
                setShowPayModal(true);
              }}
            >
              Pay
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Salary structure data
  const salaryStructure = [
    {
      position: 'Principal',
      basicSalary: 8000,
      housingAllowance: 1500,
      transportAllowance: 500,
      medicalAllowance: 400,
      totalAllowances: 2400,
      taxDeduction: 800,
      pensionDeduction: 400,
      totalDeductions: 1200,
      netSalary: 9200,
    },
    {
      position: 'Head of Department',
      basicSalary: 6000,
      housingAllowance: 1000,
      transportAllowance: 400,
      medicalAllowance: 300,
      totalAllowances: 1700,
      taxDeduction: 500,
      pensionDeduction: 300,
      totalDeductions: 800,
      netSalary: 6900,
    },
    {
      position: 'Senior Teacher',
      basicSalary: 5000,
      housingAllowance: 800,
      transportAllowance: 300,
      medicalAllowance: 250,
      totalAllowances: 1350,
      taxDeduction: 350,
      pensionDeduction: 250,
      totalDeductions: 600,
      netSalary: 5750,
    },
    {
      position: 'Teacher',
      basicSalary: 4000,
      housingAllowance: 600,
      transportAllowance: 250,
      medicalAllowance: 200,
      totalAllowances: 1050,
      taxDeduction: 250,
      pensionDeduction: 200,
      totalDeductions: 450,
      netSalary: 4600,
    },
    {
      position: 'Administrative Staff',
      basicSalary: 3500,
      housingAllowance: 500,
      transportAllowance: 200,
      medicalAllowance: 150,
      totalAllowances: 850,
      taxDeduction: 200,
      pensionDeduction: 175,
      totalDeductions: 375,
      netSalary: 3975,
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Payroll | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payroll Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage staff salaries and payments
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiDownload}>
              Export
            </Button>
            <Button
              variant="primary"
              icon={FiPlus}
              onClick={() => setShowGenerateModal(true)}
            >
              Generate Payroll
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Payroll</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">$125,000</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">$98,500</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">$26,500</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiUser className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Employees</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">85</p>
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

        {activeTab === 'payroll' && (
          <>
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={FiSearch}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select
                    options={months}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full sm:w-44"
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

            {/* Payroll Table */}
            <Card>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : payrolls.length === 0 ? (
                <EmptyState
                  icon={FiDollarSign}
                  title="No payroll records found"
                  description="Generate payroll to see records"
                  action={
                    <Button
                      variant="primary"
                      icon={FiPlus}
                      onClick={() => setShowGenerateModal(true)}
                    >
                      Generate Payroll
                    </Button>
                  }
                />
              ) : (
                <>
                  <Table columns={columns} data={payrolls} />
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
          </>
        )}

        {activeTab === 'structure' && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Salary Structure by Position
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Position
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                      Basic Salary
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                      Housing
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                      Transport
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                      Medical
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tax
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pension
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                      Net Salary
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {salaryStructure.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {row.position}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(row.basicSalary)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        +{formatCurrency(row.housingAllowance)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        +{formatCurrency(row.transportAllowance)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        +{formatCurrency(row.medicalAllowance)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        -{formatCurrency(row.taxDeduction)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        -{formatCurrency(row.pensionDeduction)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(row.netSalary)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Generate Payroll Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Payroll"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Select Month"
            options={[
              { value: 'january-2024', label: 'January 2024' },
              { value: 'february-2024', label: 'February 2024' },
            ]}
          />
          <Select
            label="Select Department"
            options={[
              { value: 'all', label: 'All Departments' },
              { value: 'teaching', label: 'Teaching Staff' },
              { value: 'admin', label: 'Administrative Staff' },
            ]}
          />
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              This will generate payroll for all selected employees based on the current salary structure.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Generate Payroll
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Process Payment"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedPayroll?.employee.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedPayroll?.month}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {selectedPayroll && formatCurrency(selectedPayroll.netSalary)}
            </p>
          </div>
          <Select
            label="Payment Method"
            options={[
              { value: 'bank', label: 'Bank Transfer' },
              { value: 'check', label: 'Check' },
              { value: 'cash', label: 'Cash' },
            ]}
          />
          <Input
            label="Payment Date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePay}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
