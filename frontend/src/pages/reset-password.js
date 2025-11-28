import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '@/components/layout';
import { Button, Input, Alert } from '@/components/ui';
import api from '@/lib/api';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (token) {
      // Verify token validity
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (resetToken) => {
    try {
      await api.get(`/auth/verify-reset-token/${resetToken}`);
      setTokenValid(true);
    } catch (error) {
      setTokenValid(false);
    }
  };

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
      toast.success('Password reset successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <AuthLayout
        title="Invalid or Expired Link"
        subtitle="This password reset link is no longer valid"
      >
        <div className="text-center">
          <Alert variant="danger" className="mb-6">
            The password reset link has expired or is invalid. Please request a new one.
          </Alert>
          <Link href="/forgot-password">
            <Button fullWidth size="lg">
              Request New Link
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        title="Password Reset Successful"
        subtitle="Your password has been updated"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link href="/login">
            <Button fullWidth size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            icon={FiLock}
            placeholder="Enter new password"
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
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            icon={FiLock}
            placeholder="Confirm new password"
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

        {/* Password Requirements */}
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p className="font-medium">Password must contain:</p>
          <ul className="list-disc list-inside space-y-1">
            <li className={password.length >= 8 ? 'text-success-600' : ''}>
              At least 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-success-600' : ''}>
              One uppercase letter
            </li>
            <li className={/[a-z]/.test(password) ? 'text-success-600' : ''}>
              One lowercase letter
            </li>
            <li className={/\d/.test(password) ? 'text-success-600' : ''}>
              One number
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
        >
          Reset Password
        </Button>

        <Link href="/login" className="block">
          <Button variant="ghost" fullWidth>
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
