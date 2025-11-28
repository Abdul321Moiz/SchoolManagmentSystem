import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiBuilding } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '@/components/layout';
import { Button, Input, Select, Checkbox, Alert } from '@/components/ui';
import { register as registerUser, clearError } from '@/store/slices/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      schoolName: '',
      role: 'school_admin',
      agreeTerms: false,
    },
  });

  const password = watch('password');
  const role = watch('role');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const { confirmPassword, agreeTerms, ...userData } = data;
    
    const result = await dispatch(registerUser(userData));

    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    }
  };

  const roleOptions = [
    { value: 'school_admin', label: 'School Administrator' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'parent', label: 'Parent' },
  ];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your school with OSMS"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert variant="danger" title="Error">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            icon={FiUser}
            placeholder="First name"
            error={errors.firstName?.message}
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'Minimum 2 characters',
              },
            })}
          />

          <Input
            label="Last Name"
            icon={FiUser}
            placeholder="Last name"
            error={errors.lastName?.message}
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Minimum 2 characters',
              },
            })}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          icon={FiMail}
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          label="Phone Number"
          type="tel"
          icon={FiPhone}
          placeholder="Enter phone number"
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
              message: 'Invalid phone number',
            },
          })}
        />

        <Select
          label="Register As"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role', {
            required: 'Please select a role',
          })}
        />

        {role === 'school_admin' && (
          <Input
            label="School Name"
            icon={FiBuilding}
            placeholder="Enter your school name"
            error={errors.schoolName?.message}
            {...register('schoolName', {
              required: role === 'school_admin' ? 'School name is required' : false,
              minLength: {
                value: 3,
                message: 'Minimum 3 characters',
              },
            })}
          />
        )}

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={FiLock}
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Must contain uppercase, lowercase and number',
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            icon={FiLock}
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>

        <Checkbox
          label={
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </span>
          }
          error={errors.agreeTerms?.message}
          {...register('agreeTerms', {
            required: 'You must agree to the terms',
          })}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
        >
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
