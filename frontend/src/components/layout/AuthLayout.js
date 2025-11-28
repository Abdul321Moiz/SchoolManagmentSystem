import React from 'react';
import Link from 'next/link';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                OSMS
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-lg text-center text-white">
              <h1 className="text-4xl font-bold mb-4">
                Online School Management System
              </h1>
              <p className="text-lg opacity-90 mb-8">
                A comprehensive solution for managing schools, students, teachers, 
                and all educational activities in one place.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Multi-Tenant</h3>
                  <p className="text-sm opacity-80">
                    Manage multiple schools from a single platform
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Role-Based Access</h3>
                  <p className="text-sm opacity-80">
                    Secure access for admins, teachers, students, and parents
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Real-Time Updates</h3>
                  <p className="text-sm opacity-80">
                    Stay updated with instant notifications
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Comprehensive Reports</h3>
                  <p className="text-sm opacity-80">
                    Generate detailed analytics and reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
