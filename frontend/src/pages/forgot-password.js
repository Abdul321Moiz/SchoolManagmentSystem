import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '@/components/layout';
import { Button, Input, Alert } from '@/components/ui';
import api from '@/lib/api';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent password reset instructions to your email"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiMail className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If an account exists with that email address, you will receive an email with 
            instructions on how to reset your password.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-primary-600 hover:text-primary-500"
            >
              try again
            </button>
          </p>
          <Link href="/login">
            <Button variant="outline" fullWidth>
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
        >
          Send Reset Link
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

export default ForgotPasswordPage;
