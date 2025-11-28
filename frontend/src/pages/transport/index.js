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
  FiTruck,
  FiMapPin,
  FiUsers,
  FiUser,
  FiPhone,
  FiClock,
  FiNavigation,
  FiMap,
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

export default function TransportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock vehicles data
  const mockVehicles = [
    {
      id: '1',
      vehicleNumber: 'BUS-001',
      type: 'Bus',
      make: 'Mercedes Benz',
      model: 'Sprinter',
      capacity: 45,
      driver: { name: 'David Wilson', phone: '+1-555-0101' },
      route: 'Route A - North Zone',
      status: 'active',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      insuranceExpiry: '2024-12-31',
    },
    {
      id: '2',
      vehicleNumber: 'BUS-002',
      type: 'Bus',
      make: 'Volvo',
      model: '9700',
      capacity: 50,
      driver: { name: 'Michael Brown', phone: '+1-555-0102' },
      route: 'Route B - South Zone',
      status: 'active',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-04-05',
      insuranceExpiry: '2024-10-15',
    },
    {
      id: '3',
      vehicleNumber: 'VAN-001',
      type: 'Van',
      make: 'Toyota',
      model: 'Hiace',
      capacity: 15,
      driver: { name: 'Robert Johnson', phone: '+1-555-0103' },
      route: 'Route C - East Zone',
      status: 'maintenance',
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-01-25',
      insuranceExpiry: '2024-08-20',
    },
    {
      id: '4',
      vehicleNumber: 'BUS-003',
      type: 'Bus',
      make: 'Blue Bird',
      model: 'Vision',
      capacity: 40,
      driver: { name: 'James Anderson', phone: '+1-555-0104' },
      route: 'Route D - West Zone',
      status: 'active',
      lastMaintenance: '2023-12-20',
      nextMaintenance: '2024-03-20',
      insuranceExpiry: '2024-06-30',
    },
    {
      id: '5',
      vehicleNumber: 'VAN-002',
      type: 'Van',
      make: 'Ford',
      model: 'Transit',
      capacity: 12,
      driver: null,
      route: null,
      status: 'inactive',
      lastMaintenance: '2023-11-15',
      nextMaintenance: '2024-02-15',
      insuranceExpiry: '2024-05-10',
    },
  ];

  // Mock routes data
  const mockRoutes = [
    {
      id: '1',
      name: 'Route A - North Zone',
      description: 'Covers northern residential areas',
      stops: [
        { name: 'Main Gate', time: '7:00 AM' },
        { name: 'Green Valley', time: '7:15 AM' },
        { name: 'Oak Street', time: '7:25 AM' },
        { name: 'School', time: '7:45 AM' },
      ],
      vehicle: { number: 'BUS-001', driver: 'David Wilson' },
      students: 38,
      distance: '15 km',
      duration: '45 mins',
      status: 'active',
    },
    {
      id: '2',
      name: 'Route B - South Zone',
      description: 'Covers southern residential areas',
      stops: [
        { name: 'Central Park', time: '6:45 AM' },
        { name: 'Maple Avenue', time: '7:00 AM' },
        { name: 'River Road', time: '7:15 AM' },
        { name: 'School', time: '7:40 AM' },
      ],
      vehicle: { number: 'BUS-002', driver: 'Michael Brown' },
      students: 45,
      distance: '18 km',
      duration: '55 mins',
      status: 'active',
    },
    {
      id: '3',
      name: 'Route C - East Zone',
      description: 'Covers eastern residential areas',
      stops: [
        { name: 'East End', time: '7:00 AM' },
        { name: 'Sunrise Colony', time: '7:20 AM' },
        { name: 'School', time: '7:35 AM' },
      ],
      vehicle: { number: 'VAN-001', driver: 'Robert Johnson' },
      students: 12,
      distance: '10 km',
      duration: '35 mins',
      status: 'inactive',
    },
    {
      id: '4',
      name: 'Route D - West Zone',
      description: 'Covers western residential areas',
      stops: [
        { name: 'West Gate', time: '6:50 AM' },
        { name: 'Hill View', time: '7:10 AM' },
        { name: 'Lake Side', time: '7:25 AM' },
        { name: 'Valley Road', time: '7:35 AM' },
        { name: 'School', time: '7:50 AM' },
      ],
      vehicle: { number: 'BUS-003', driver: 'James Anderson' },
      students: 35,
      distance: '20 km',
      duration: '60 mins',
      status: 'active',
    },
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const tabs = [
    { id: 'vehicles', label: 'Vehicles', icon: FiTruck },
    { id: 'routes', label: 'Routes', icon: FiMapPin },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setVehicles(mockVehicles);
      setRoutes(mockRoutes);
      setTotalPages(2);
      setLoading(false);
    };

    fetchData();
  }, [currentPage, searchQuery, selectedStatus, activeTab]);

  const getStatusBadge = (status) => {
    const config = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      maintenance: { variant: 'warning', label: 'Maintenance' },
    };
    const c = config[status] || config.inactive;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const vehicleColumns = [
    {
      key: 'vehicleNumber',
      label: 'Vehicle',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <FiTruck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.vehicleNumber}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.make} {row.model}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge variant="secondary">{row.type}</Badge>,
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span>{row.capacity} seats</span>
        </div>
      ),
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (row) => (
        row.driver ? (
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.driver.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FiPhone className="w-3 h-3" /> {row.driver.phone}
            </p>
          </div>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        )
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (row) => row.route || <span className="text-gray-400">Not assigned</span>,
    },
    {
      key: 'insurance',
      label: 'Insurance Expiry',
      render: (row) => (
        <span className={`${isExpired(row.insuranceExpiry) ? 'text-red-600' : isExpiringSoon(row.insuranceExpiry) ? 'text-orange-600' : ''}`}>
          {formatDate(row.insuranceExpiry)}
          {isExpired(row.insuranceExpiry) && <Badge variant="error" className="ml-2">Expired</Badge>}
          {isExpiringSoon(row.insuranceExpiry) && !isExpired(row.insuranceExpiry) && <Badge variant="warning" className="ml-2">Soon</Badge>}
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
            onClick={() => router.push(`/transport/vehicles/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/transport/vehicles/${row.id}/edit`)}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedItem(row);
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

  const routeColumns = [
    {
      key: 'name',
      label: 'Route',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <FiMapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'stops',
      label: 'Stops',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiNavigation className="w-4 h-4 text-gray-400" />
          <span>{row.stops.length} stops</span>
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehicle & Driver',
      render: (row) => (
        row.vehicle ? (
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.vehicle.number}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{row.vehicle.driver}</p>
          </div>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        )
      ),
    },
    {
      key: 'students',
      label: 'Students',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span>{row.students}</span>
        </div>
      ),
    },
    {
      key: 'distance',
      label: 'Distance',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiMap className="w-4 h-4 text-gray-400" />
          <span>{row.distance}</span>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => (
        <div className="flex items-center gap-1">
          <FiClock className="w-4 h-4 text-gray-400" />
          <span>{row.duration}</span>
        </div>
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
            onClick={() => router.push(`/transport/routes/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/transport/routes/${row.id}/edit`)}
            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedItem(row);
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
        <title>Transport | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transport Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage vehicles and routes
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiDownload}>
              Export
            </Button>
            {activeTab === 'vehicles' && (
              <Button
                variant="primary"
                icon={FiPlus}
                onClick={() => router.push('/transport/vehicles/add')}
              >
                Add Vehicle
              </Button>
            )}
            {activeTab === 'routes' && (
              <Button
                variant="primary"
                icon={FiPlus}
                onClick={() => router.push('/transport/routes/add')}
              >
                Add Route
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiTruck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiMapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Routes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiUsers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Students Using</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">450</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiUser className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Drivers</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">10</p>
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
                placeholder={activeTab === 'vehicles' ? 'Search vehicles...' : 'Search routes...'}
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

        {/* Content Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {activeTab === 'vehicles' ? (
                vehicles.length === 0 ? (
                  <EmptyState
                    icon={FiTruck}
                    title="No vehicles found"
                    description="Get started by adding vehicles to your fleet"
                    action={
                      <Button
                        variant="primary"
                        icon={FiPlus}
                        onClick={() => router.push('/transport/vehicles/add')}
                      >
                        Add Vehicle
                      </Button>
                    }
                  />
                ) : (
                  <Table columns={vehicleColumns} data={vehicles} />
                )
              ) : (
                routes.length === 0 ? (
                  <EmptyState
                    icon={FiMapPin}
                    title="No routes found"
                    description="Get started by creating transport routes"
                    action={
                      <Button
                        variant="primary"
                        icon={FiPlus}
                        onClick={() => router.push('/transport/routes/add')}
                      >
                        Add Route
                      </Button>
                    }
                  />
                ) : (
                  <Table columns={routeColumns} data={routes} />
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
        title={activeTab === 'vehicles' ? 'Delete Vehicle' : 'Delete Route'}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{selectedItem?.vehicleNumber || selectedItem?.name}&quot;?
            This action cannot be undone.
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
