import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { FiBook, FiUsers, FiCalendar, FiCreditCard, FiBarChart2, FiShield } from 'react-icons/fi';

const features = [
  {
    icon: FiUsers,
    title: 'Student Management',
    description: 'Complete student lifecycle management from admission to graduation.',
  },
  {
    icon: FiBook,
    title: 'Academic Management',
    description: 'Manage classes, subjects, exams, assignments and results efficiently.',
  },
  {
    icon: FiCalendar,
    title: 'Attendance Tracking',
    description: 'Track student and staff attendance with detailed reports.',
  },
  {
    icon: FiCreditCard,
    title: 'Fee Management',
    description: 'Comprehensive fee collection, invoicing and payment tracking.',
  },
  {
    icon: FiBarChart2,
    title: 'Reports & Analytics',
    description: 'Generate detailed reports and gain insights with analytics.',
  },
  {
    icon: FiShield,
    title: 'Secure & Scalable',
    description: 'Enterprise-grade security with multi-tenant architecture.',
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      const dashboardRoutes = {
        super_admin: '/admin/dashboard',
        school_admin: '/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard',
      };
      router.push(dashboardRoutes[user.role] || '/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gradient">OSMS</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 dark:text-gray-300">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 dark:text-gray-300">
                Pricing
              </a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 dark:text-gray-300">
                Contact
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Modern School Management
            <span className="block text-gradient">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            An enterprise-grade, cloud-native platform to manage your educational institution efficiently. 
            From admissions to graduation, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Start Free Trial
            </Link>
            <Link href="#features" className="btn btn-outline btn-lg">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive features to streamline every aspect of school management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card card-hover">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of schools already using OSMS to manage their institutions efficiently.
          </p>
          <Link href="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-white">OSMS</span>
              <p className="mt-4 text-sm">
                Enterprise-grade school management system for modern educational institutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} OSMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
