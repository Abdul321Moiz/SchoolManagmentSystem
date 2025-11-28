import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import {
  FiSave, FiX, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin,
  FiUpload, FiBook, FiUsers,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { DashboardLayout, Breadcrumbs } from '@/components/layout';
import { Card, Button, Input, Select, Textarea, Checkbox, Tabs } from '@/components/ui';
import api from '@/lib/api';

const AddStudentPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [avatar, setAvatar] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Personal Info
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      religion: '',
      nationality: '',
      // Contact Info
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      // Academic Info
      admissionNumber: '',
      admissionDate: '',
      class: '',
      section: '',
      rollNumber: '',
      previousSchool: '',
      // Parent Info
      fatherName: '',
      fatherOccupation: '',
      fatherPhone: '',
      fatherEmail: '',
      motherName: '',
      motherOccupation: '',
      motherPhone: '',
      motherEmail: '',
      guardianName: '',
      guardianRelation: '',
      guardianPhone: '',
      guardianEmail: '',
      // Transport
      useTransport: false,
      route: '',
      pickupPoint: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      if (avatar) {
        formData.append('avatar', avatar);
      }

      // await api.post('/students', formData);
      toast.success('Student added successfully!');
      router.push('/students');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
  ];

  const classOptions = Array.from({ length: 12 }, (_, i) => ({
    value: `grade-${i + 1}`,
    label: `Grade ${i + 1}`,
  }));

  const sectionOptions = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' },
  ];

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'academic', label: 'Academic Info', icon: FiBook },
    { id: 'parent', label: 'Parent/Guardian', icon: FiUsers },
    { id: 'transport', label: 'Transport', icon: FiMapPin },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Add Student - OSMS</title>
      </Head>

      {/* Header */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Students', path: '/students' },
            { label: 'Add Student', path: '/students/add' },
          ]}
        />
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Student
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Fill in the details to enroll a new student
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Avatar Upload */}
          <div className="lg:col-span-1">
            <Card>
              <Card.Content>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mb-4">
                    {avatar ? (
                      <img
                        src={URL.createObjectURL(avatar)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" icon={FiUpload}>
                      Upload Photo
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Allowed: JPG, PNG, GIF<br />Max size: 2MB
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <Card.Content>
                <Tabs
                  tabs={tabs}
                  defaultTab="personal"
                  onChange={setActiveTab}
                  variant="line"
                />

                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        required
                        error={errors.firstName?.message}
                        {...register('firstName', { required: 'First name is required' })}
                      />
                      <Input
                        label="Last Name"
                        required
                        error={errors.lastName?.message}
                        {...register('lastName', { required: 'Last name is required' })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Date of Birth"
                        type="date"
                        required
                        error={errors.dateOfBirth?.message}
                        {...register('dateOfBirth', { required: 'Date of birth is required' })}
                      />
                      <Select
                        label="Gender"
                        options={genderOptions}
                        required
                        error={errors.gender?.message}
                        {...register('gender', { required: 'Gender is required' })}
                      />
                      <Select
                        label="Blood Group"
                        options={bloodGroupOptions}
                        {...register('bloodGroup')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Religion"
                        {...register('religion')}
                      />
                      <Input
                        label="Nationality"
                        {...register('nationality')}
                      />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        icon={FiMail}
                        error={errors.email?.message}
                        {...register('email', {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        icon={FiPhone}
                        {...register('phone')}
                      />
                    </div>

                    <Textarea
                      label="Address"
                      rows={3}
                      {...register('address')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        label="City"
                        {...register('city')}
                      />
                      <Input
                        label="State/Province"
                        {...register('state')}
                      />
                      <Input
                        label="ZIP Code"
                        {...register('zipCode')}
                      />
                      <Input
                        label="Country"
                        {...register('country')}
                      />
                    </div>
                  </div>
                )}

                {/* Academic Info Tab */}
                {activeTab === 'academic' && (
                  <div className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Admission Number"
                        required
                        error={errors.admissionNumber?.message}
                        {...register('admissionNumber', { required: 'Admission number is required' })}
                      />
                      <Input
                        label="Admission Date"
                        type="date"
                        required
                        error={errors.admissionDate?.message}
                        {...register('admissionDate', { required: 'Admission date is required' })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        label="Class"
                        options={classOptions}
                        required
                        error={errors.class?.message}
                        {...register('class', { required: 'Class is required' })}
                      />
                      <Select
                        label="Section"
                        options={sectionOptions}
                        required
                        error={errors.section?.message}
                        {...register('section', { required: 'Section is required' })}
                      />
                      <Input
                        label="Roll Number"
                        {...register('rollNumber')}
                      />
                    </div>

                    <Input
                      label="Previous School"
                      {...register('previousSchool')}
                    />
                  </div>
                )}

                {/* Parent/Guardian Tab */}
                {activeTab === 'parent' && (
                  <div className="space-y-6 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Father&apos;s Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Father's Name"
                        required
                        error={errors.fatherName?.message}
                        {...register('fatherName', { required: "Father's name is required" })}
                      />
                      <Input
                        label="Occupation"
                        {...register('fatherOccupation')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone"
                        type="tel"
                        icon={FiPhone}
                        {...register('fatherPhone')}
                      />
                      <Input
                        label="Email"
                        type="email"
                        icon={FiMail}
                        {...register('fatherEmail')}
                      />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Mother&apos;s Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Mother's Name"
                        required
                        error={errors.motherName?.message}
                        {...register('motherName', { required: "Mother's name is required" })}
                      />
                      <Input
                        label="Occupation"
                        {...register('motherOccupation')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone"
                        type="tel"
                        icon={FiPhone}
                        {...register('motherPhone')}
                      />
                      <Input
                        label="Email"
                        type="email"
                        icon={FiMail}
                        {...register('motherEmail')}
                      />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Guardian Information (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Guardian Name"
                        {...register('guardianName')}
                      />
                      <Input
                        label="Relation"
                        {...register('guardianRelation')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone"
                        type="tel"
                        icon={FiPhone}
                        {...register('guardianPhone')}
                      />
                      <Input
                        label="Email"
                        type="email"
                        icon={FiMail}
                        {...register('guardianEmail')}
                      />
                    </div>
                  </div>
                )}

                {/* Transport Tab */}
                {activeTab === 'transport' && (
                  <div className="space-y-6 mt-6">
                    <Checkbox
                      label="Use School Transport"
                      {...register('useTransport')}
                    />

                    {watch('useTransport') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="Route"
                          options={[
                            { value: 'route-1', label: 'Route 1 - North' },
                            { value: 'route-2', label: 'Route 2 - South' },
                            { value: 'route-3', label: 'Route 3 - East' },
                            { value: 'route-4', label: 'Route 4 - West' },
                          ]}
                          {...register('route')}
                        />
                        <Input
                          label="Pickup Point"
                          {...register('pickupPoint')}
                        />
                      </div>
                    )}
                  </div>
                )}
              </Card.Content>
              <Card.Footer>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/students')}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading} icon={FiSave}>
                  Save Student
                </Button>
              </Card.Footer>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default AddStudentPage;
