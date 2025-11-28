import { useState } from 'react';
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiCamera,
  FiSave,
  FiX,
  FiBriefcase,
  FiAward,
  FiBook,
  FiClock,
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Card,
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  Avatar,
  Tabs,
} from '../../components/ui';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@school.edu',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    bio: 'Experienced educator with over 10 years in academic administration. Passionate about leveraging technology to improve educational outcomes.',
    department: 'Administration',
    position: 'School Administrator',
    employeeId: 'EMP-001',
    joinDate: '2018-08-01',
    qualification: "Master's in Education",
    specialization: 'Educational Technology',
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'activity', label: 'Activity', icon: FiClock },
    { id: 'documents', label: 'Documents', icon: FiBook },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset changes
  };

  // Mock activity data
  const activities = [
    {
      id: 1,
      action: 'Updated student record',
      target: 'John Smith - Class 10A',
      time: '2 hours ago',
    },
    {
      id: 2,
      action: 'Approved fee payment',
      target: '$1,500 - Sarah Johnson',
      time: '4 hours ago',
    },
    {
      id: 3,
      action: 'Created new class',
      target: 'Class 11B - Science',
      time: '1 day ago',
    },
    {
      id: 4,
      action: 'Sent notification',
      target: 'Fee Reminder - All Parents',
      time: '2 days ago',
    },
    {
      id: 5,
      action: 'Generated report',
      target: 'Monthly Attendance Report',
      time: '3 days ago',
    },
  ];

  // Mock documents data
  const documents = [
    {
      id: 1,
      name: 'Employment Contract',
      type: 'PDF',
      size: '245 KB',
      uploadedAt: '2018-08-01',
    },
    {
      id: 2,
      name: 'ID Proof',
      type: 'PDF',
      size: '1.2 MB',
      uploadedAt: '2018-08-01',
    },
    {
      id: 3,
      name: 'Degree Certificate',
      type: 'PDF',
      size: '856 KB',
      uploadedAt: '2018-08-01',
    },
    {
      id: 4,
      name: 'Resume',
      type: 'PDF',
      size: '324 KB',
      uploadedAt: '2018-08-01',
    },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Profile | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar
                src={user?.avatar}
                name={`${profile.firstName} ${profile.lastName}`}
                size="xl"
                className="w-24 h-24"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <FiCamera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.firstName} {profile.lastName}
                </h1>
                <Badge variant="primary">{profile.position}</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {profile.department}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <FiPhone className="w-4 h-4" />
                  {profile.phone}
                </span>
                <span className="flex items-center gap-1">
                  <FiBriefcase className="w-4 h-4" />
                  {profile.employeeId}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" icon={FiX} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={FiSave}
                    onClick={handleSave}
                    loading={saving}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  icon={FiEdit2}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card className="lg:col-span-2 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
                <Select
                  label="Gender"
                  options={genderOptions}
                  value={profile.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Professional Information */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Professional Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FiBriefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(profile.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FiAward className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Qualification</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.qualification}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FiBook className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Specialization</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.specialization}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">6</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Years</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">1,250</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">85</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Teachers</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">24</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Classes</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <FiClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.target}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documents
              </h3>
              <Button variant="primary" size="sm">
                Upload Document
              </Button>
            </div>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded">
                      <FiBook className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {doc.type} • {doc.size} • Uploaded on{' '}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
