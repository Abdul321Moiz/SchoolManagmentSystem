import { useState } from 'react';
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiUser,
  FiLock,
  FiBell,
  FiGlobe,
  FiMonitor,
  FiShield,
  FiMail,
  FiSmartphone,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Card,
  Button,
  Input,
  Select,
  Tabs,
  Badge,
  Checkbox,
  Avatar,
} from '../../components/ui';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // General
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
    
    // Appearance
    theme: 'system',
    compactMode: false,
    animationsEnabled: true,
    
    // Security
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginNotifications: true,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'appearance', label: 'Appearance', icon: FiMonitor },
    { id: 'security', label: 'Security', icon: FiShield },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'hi', label: 'Hindi' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Kolkata', label: 'India Standard Time' },
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const timeFormats = [
    { value: '12h', label: '12 Hour (AM/PM)' },
    { value: '24h', label: '24 Hour' },
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' },
  ];

  const sessionTimeouts = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '0', label: 'Never' },
  ];

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success message
  };

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-3"
    >
      {enabled ? (
        <FiToggleRight className="w-10 h-10 text-blue-600" />
      ) : (
        <FiToggleLeft className="w-10 h-10 text-gray-400" />
      )}
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );

  return (
    <DashboardLayout>
      <Head>
        <title>Settings | School Management System</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account and application preferences
            </p>
          </div>
          <Button
            variant="primary"
            icon={FiSave}
            onClick={handleSave}
            loading={saving}
          >
            Save Changes
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Regional Settings
              </h3>
              <div className="space-y-4">
                <Select
                  label="Language"
                  options={languages}
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                />
                <Select
                  label="Timezone"
                  options={timezones}
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                />
                <Select
                  label="Date Format"
                  options={dateFormats}
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                />
                <Select
                  label="Time Format"
                  options={timeFormats}
                  value={settings.timeFormat}
                  onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar
                    src={user?.avatar}
                    name={user?.name || 'User'}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.name || 'John Doe'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email || 'john@example.com'}
                    </p>
                    <Badge variant="primary" className="mt-1">
                      {user?.role || 'School Admin'}
                    </Badge>
                  </div>
                </div>
                <Button variant="secondary" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Channels
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiMail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.emailNotifications}
                    onChange={(v) => handleSettingChange('emailNotifications', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiBell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.pushNotifications}
                    onChange={(v) => handleSettingChange('pushNotifications', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiSmartphone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.smsNotifications}
                    onChange={(v) => handleSettingChange('smsNotifications', v)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <Checkbox
                  label="Send me a weekly digest of activities"
                  checked={settings.weeklyDigest}
                  onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                />
                <Checkbox
                  label="Receive marketing and promotional emails"
                  checked={settings.marketingEmails}
                  onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Theme
              </h3>
              <div className="space-y-4">
                <Select
                  label="Color Theme"
                  options={themes}
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {['light', 'dark', 'system'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleSettingChange('theme', theme)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.theme === theme
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className={`w-full h-16 rounded mb-2 ${
                        theme === 'light' ? 'bg-white border' :
                        theme === 'dark' ? 'bg-gray-900' :
                        'bg-gradient-to-r from-white to-gray-900'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {theme}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Display Options
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
                    <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.compactMode}
                    onChange={(v) => handleSettingChange('compactMode', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Animations</p>
                    <p className="text-sm text-gray-500">Enable interface animations</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.animationsEnabled}
                    onChange={(v) => handleSettingChange('animationsEnabled', v)}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Authentication
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiShield className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.twoFactorEnabled}
                    onChange={(v) => handleSettingChange('twoFactorEnabled', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiBell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Login Notifications</p>
                      <p className="text-sm text-gray-500">Get notified of new sign-ins</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.loginNotifications}
                    onChange={(v) => handleSettingChange('loginNotifications', v)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Session Settings
              </h3>
              <div className="space-y-4">
                <Select
                  label="Session Timeout"
                  options={sessionTimeouts}
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                />
                <Button variant="secondary" className="w-full">
                  Sign Out of All Devices
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <Input
                  type="password"
                  label="Current Password"
                  placeholder="Enter current password"
                />
                <Input
                  type="password"
                  label="New Password"
                  placeholder="Enter new password"
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                />
                <Button variant="primary" icon={FiLock}>
                  Update Password
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-red-200 dark:border-red-900">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="danger">
                Delete Account
              </Button>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
