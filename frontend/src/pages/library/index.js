import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiBook,
  FiBookOpen,
  FiUser,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
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

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Mock books data
  const mockBooks = [
    {
      id: '1',
      title: 'Introduction to Physics',
      author: 'Dr. Richard Feynman',
      isbn: '978-0-13-235088-4',
      category: 'Science',
      publisher: 'Pearson Education',
      year: 2020,
      quantity: 15,
      available: 8,
      location: 'Shelf A-12',
      status: 'available',
    },
    {
      id: '2',
      title: 'Mathematics for Engineers',
      author: 'K. Stroud',
      isbn: '978-1-137-03204-5',
      category: 'Mathematics',
      publisher: 'Palgrave',
      year: 2019,
      quantity: 20,
      available: 12,
      location: 'Shelf B-05',
      status: 'available',
    },
    {
      id: '3',
      title: 'English Literature',
      author: 'William Shakespeare',
      isbn: '978-0-14-028662-5',
      category: 'Literature',
      publisher: 'Penguin',
      year: 2018,
      quantity: 25,
      available: 0,
      location: 'Shelf C-08',
      status: 'unavailable',
    },
    {
      id: '4',
      title: 'History of Modern World',
      author: 'Eric Hobsbawm',
      isbn: '978-0-679-72357-3',
      category: 'History',
      publisher: 'Vintage',
      year: 2021,
      quantity: 10,
      available: 5,
      location: 'Shelf D-15',
      status: 'available',
    },
    {
      id: '5',
      title: 'Organic Chemistry',
      author: 'Morrison & Boyd',
      isbn: '978-0-13-458713-5',
      category: 'Science',
      publisher: 'Pearson',
      year: 2022,
      quantity: 12,
      available: 3,
      location: 'Shelf A-20',
      status: 'low_stock',
    },
  ];

  // Mock issued books data
  const mockIssuedBooks = [
    {
      id: '1',
      book: { title: 'Introduction to Physics', author: 'Dr. Richard Feynman' },
      member: { name: 'John Doe', type: 'Student', class: 'Class 10-A' },
      issueDate: '2024-01-10',
      dueDate: '2024-01-24',
      returnDate: null,
      status: 'issued',
      fine: 0,
    },
    {
      id: '2',
      book: { title: 'Mathematics for Engineers', author: 'K. Stroud' },
      member: { name: 'Jane Smith', type: 'Teacher', department: 'Science' },
      issueDate: '2024-01-05',
      dueDate: '2024-01-19',
      returnDate: null,
      status: 'overdue',
      fine: 50,
    },
    {
      id: '3',
      book: { title: 'English Literature', author: 'William Shakespeare' },
      member: { name: 'Mike Johnson', type: 'Student', class: 'Class 12-B' },
      issueDate: '2024-01-01',
      dueDate: '2024-01-15',
      returnDate: '2024-01-14',
      status: 'returned',
      fine: 0,
    },
    {
      id: '4',
      book: { title: 'History of Modern World', author: 'Eric Hobsbawm' },
      member: { name: 'Sarah Williams', type: 'Student', class: 'Class 11-A' },
      issueDate: '2024-01-15',
      dueDate: '2024-01-29',
      returnDate: null,
      status: 'issued',
      fine: 0,
    },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'science', label: 'Science' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'literature', label: 'Literature' },
    { value: 'history', label: 'History' },
    { value: 'computer', label: 'Computer Science' },
  ];

  const bookStatuses = [
    { value: '', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Unavailable' },
    { value: 'low_stock', label: 'Low Stock' },
  ];

  const issueStatuses = [
    { value: '', label: 'All Status' },
    { value: 'issued', label: 'Issued' },
    { value: 'returned', label: 'Returned' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const tabs = [
    { id: 'books', label: 'Books Catalog', icon: FiBook },
    { id: 'issued', label: 'Issued Books', icon: FiBookOpen },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setBooks(mockBooks);
      setIssuedBooks(mockIssuedBooks);
      setTotalPages(3);
      setLoading(false);
    };

    fetchData();
  }, [currentPage, searchQuery, selectedCategory, selectedStatus, activeTab]);

  const getBookStatusBadge = (status, available) => {
    if (available === 0) {
      return <Badge variant="error">Unavailable</Badge>;
    } else if (available < 5) {
      return <Badge variant="warning">Low Stock</Badge>;
    }
    return <Badge variant="success">Available</Badge>;
  };

  const getIssueStatusBadge = (status) => {
    const config = {
      issued: { variant: 'primary', label: 'Issued' },
      returned: { variant: 'success', label: 'Returned' },
      overdue: { variant: 'error', label: 'Overdue' },
    };
    const c = config[status] || config.issued;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    setSelectedBook(null);
  };

  const bookColumns = [
    {
      key: 'title',
      label: 'Book',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">by {row.author}</p>
        </div>
      ),
    },
    {
      key: 'isbn',
      label: 'ISBN',
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <Badge variant="secondary">{row.category}</Badge>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (row) => (
        <div className="text-center">
          <p className="font-medium text-gray-900 dark:text-white">{row.quantity}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      ),
    },
    {
      key: 'available',
      label: 'Available',
      render: (row) => (
        <div className="text-center">
          <p className={`font-medium ${row.available === 0 ? 'text-red-600' : row.available < 5 ? 'text-orange-600' : 'text-green-600'}`}>
            {row.available}
          </p>
          <p className="text-xs text-gray-500">Copies</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getBookStatusBadge(row.status, row.available),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/library/books/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/library/books/${row.id}/edit`)}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedBook(row);
              setShowIssueModal(true);
            }}
            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
            title="Issue Book"
            disabled={row.available === 0}
          >
            <FiBookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedBook(row);
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

  const issuedColumns = [
    {
      key: 'book',
      label: 'Book',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.book.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">by {row.book.author}</p>
        </div>
      ),
    },
    {
      key: 'member',
      label: 'Issued To',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.member.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {row.member.type} - {row.member.class || row.member.department}
          </p>
        </div>
      ),
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => (
        <span className={row.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'returnDate',
      label: 'Return Date',
      render: (row) => formatDate(row.returnDate),
    },
    {
      key: 'fine',
      label: 'Fine',
      render: (row) => (
        <span className={row.fine > 0 ? 'text-red-600 font-medium' : ''}>
          ${row.fine.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getIssueStatusBadge(row.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'issued' || row.status === 'overdue' ? (
            <Button
              size="sm"
              variant="secondary"
              icon={FiRefreshCw}
              onClick={() => {/* Handle return */}}
            >
              Return
            </Button>
          ) : (
            <span className="text-gray-400 text-sm">Returned</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Library | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Library Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage books and track issued items
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiDownload}>
              Export
            </Button>
            {activeTab === 'books' && (
              <Button
                variant="primary"
                icon={FiPlus}
                onClick={() => router.push('/library/books/add')}
              >
                Add Book
              </Button>
            )}
            {activeTab === 'issued' && (
              <Button
                variant="primary"
                icon={FiBookOpen}
                onClick={() => setShowIssueModal(true)}
              >
                Issue Book
              </Button>
            )}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Books</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">2,450</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1,850</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiBookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Issued</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">580</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">20</p>
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
                placeholder={activeTab === 'books' ? 'Search books by title, author, ISBN...' : 'Search by member name or book title...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {activeTab === 'books' && (
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-40"
                />
              )}
              <Select
                options={activeTab === 'books' ? bookStatuses : issueStatuses}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-36"
              />
            </div>
          </div>
        </Card>

        {/* Content Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {activeTab === 'books' ? (
                books.length === 0 ? (
                  <EmptyState
                    icon={FiBook}
                    title="No books found"
                    description="Get started by adding books to your library"
                    action={
                      <Button
                        variant="primary"
                        icon={FiPlus}
                        onClick={() => router.push('/library/books/add')}
                      >
                        Add Book
                      </Button>
                    }
                  />
                ) : (
                  <Table columns={bookColumns} data={books} />
                )
              ) : (
                issuedBooks.length === 0 ? (
                  <EmptyState
                    icon={FiBookOpen}
                    title="No issued books"
                    description="No books have been issued yet"
                    action={
                      <Button
                        variant="primary"
                        icon={FiBookOpen}
                        onClick={() => setShowIssueModal(true)}
                      >
                        Issue Book
                      </Button>
                    }
                  />
                ) : (
                  <Table columns={issuedColumns} data={issuedBooks} />
                )
              )}
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
        title="Delete Book"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{selectedBook?.title}&quot;? This action cannot be
            undone.
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

      {/* Issue Book Modal */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Issue Book"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Search Book"
            placeholder="Enter book title or ISBN"
            icon={FiSearch}
          />
          <Select
            label="Select Member"
            options={[
              { value: '', label: 'Select member' },
              { value: '1', label: 'John Doe - Student (Class 10-A)' },
              { value: '2', label: 'Jane Smith - Teacher (Science)' },
            ]}
          />
          <Input
            label="Issue Date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="Due Date"
            type="date"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowIssueModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Issue Book
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
