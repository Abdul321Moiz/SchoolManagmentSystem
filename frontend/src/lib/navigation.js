// Role-based navigation configuration
export const navigationConfig = {
  super_admin: [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'FiHome',
    },
    {
      title: 'Schools',
      path: '/admin/schools',
      icon: 'FiGrid',
    },
    {
      title: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: 'FiCreditCard',
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: 'FiUsers',
    },
    {
      title: 'Reports',
      path: '/admin/reports',
      icon: 'FiBarChart2',
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: 'FiSettings',
    },
  ],
  school_admin: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'FiHome',
    },
    {
      title: 'Students',
      path: '/students',
      icon: 'FiUsers',
      children: [
        { title: 'All Students', path: '/students' },
        { title: 'Add Student', path: '/students/add' },
        { title: 'Promotion', path: '/students/promotion' },
      ],
    },
    {
      title: 'Teachers',
      path: '/teachers',
      icon: 'FiUser',
      children: [
        { title: 'All Teachers', path: '/teachers' },
        { title: 'Add Teacher', path: '/teachers/add' },
      ],
    },
    {
      title: 'Parents',
      path: '/parents',
      icon: 'FiUserPlus',
    },
    {
      title: 'Classes',
      path: '/classes',
      icon: 'FiBookOpen',
      children: [
        { title: 'All Classes', path: '/classes' },
        { title: 'Sections', path: '/classes/sections' },
        { title: 'Subjects', path: '/subjects' },
      ],
    },
    {
      title: 'Attendance',
      path: '/attendance',
      icon: 'FiCheckSquare',
      children: [
        { title: 'Student Attendance', path: '/attendance/students' },
        { title: 'Teacher Attendance', path: '/attendance/teachers' },
        { title: 'Report', path: '/attendance/report' },
      ],
    },
    {
      title: 'Examinations',
      path: '/exams',
      icon: 'FiFileText',
      children: [
        { title: 'Exams', path: '/exams' },
        { title: 'Results', path: '/results' },
        { title: 'Report Cards', path: '/results/report-cards' },
      ],
    },
    {
      title: 'Assignments',
      path: '/assignments',
      icon: 'FiClipboard',
    },
    {
      title: 'Fees',
      path: '/fees',
      icon: 'FiDollarSign',
      children: [
        { title: 'Fee Structure', path: '/fees/structure' },
        { title: 'Invoices', path: '/fees/invoices' },
        { title: 'Payments', path: '/fees/payments' },
        { title: 'Report', path: '/fees/report' },
      ],
    },
    {
      title: 'Payroll',
      path: '/payroll',
      icon: 'FiCreditCard',
      children: [
        { title: 'Salary Structure', path: '/payroll/structure' },
        { title: 'Payroll Records', path: '/payroll/records' },
      ],
    },
    {
      title: 'Library',
      path: '/library',
      icon: 'FiBook',
      children: [
        { title: 'Books', path: '/library/books' },
        { title: 'Issue/Return', path: '/library/issues' },
      ],
    },
    {
      title: 'Transport',
      path: '/transport',
      icon: 'FiTruck',
      children: [
        { title: 'Vehicles', path: '/transport/vehicles' },
        { title: 'Routes', path: '/transport/routes' },
        { title: 'Assignments', path: '/transport/assignments' },
      ],
    },
    {
      title: 'Notifications',
      path: '/notifications',
      icon: 'FiBell',
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: 'FiBarChart2',
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: 'FiSettings',
    },
  ],
  teacher: [
    {
      title: 'Dashboard',
      path: '/teacher/dashboard',
      icon: 'FiHome',
    },
    {
      title: 'My Classes',
      path: '/teacher/classes',
      icon: 'FiBookOpen',
    },
    {
      title: 'Students',
      path: '/teacher/students',
      icon: 'FiUsers',
    },
    {
      title: 'Attendance',
      path: '/teacher/attendance',
      icon: 'FiCheckSquare',
    },
    {
      title: 'Assignments',
      path: '/teacher/assignments',
      icon: 'FiClipboard',
    },
    {
      title: 'Exams & Results',
      path: '/teacher/exams',
      icon: 'FiFileText',
    },
    {
      title: 'Schedule',
      path: '/teacher/schedule',
      icon: 'FiCalendar',
    },
    {
      title: 'Notifications',
      path: '/teacher/notifications',
      icon: 'FiBell',
    },
  ],
  student: [
    {
      title: 'Dashboard',
      path: '/student/dashboard',
      icon: 'FiHome',
    },
    {
      title: 'My Classes',
      path: '/student/classes',
      icon: 'FiBookOpen',
    },
    {
      title: 'Attendance',
      path: '/student/attendance',
      icon: 'FiCheckSquare',
    },
    {
      title: 'Assignments',
      path: '/student/assignments',
      icon: 'FiClipboard',
    },
    {
      title: 'Exams',
      path: '/student/exams',
      icon: 'FiFileText',
    },
    {
      title: 'Results',
      path: '/student/results',
      icon: 'FiAward',
    },
    {
      title: 'Fees',
      path: '/student/fees',
      icon: 'FiDollarSign',
    },
    {
      title: 'Library',
      path: '/student/library',
      icon: 'FiBook',
    },
    {
      title: 'Transport',
      path: '/student/transport',
      icon: 'FiTruck',
    },
    {
      title: 'Notifications',
      path: '/student/notifications',
      icon: 'FiBell',
    },
  ],
  parent: [
    {
      title: 'Dashboard',
      path: '/parent/dashboard',
      icon: 'FiHome',
    },
    {
      title: 'My Children',
      path: '/parent/children',
      icon: 'FiUsers',
    },
    {
      title: 'Attendance',
      path: '/parent/attendance',
      icon: 'FiCheckSquare',
    },
    {
      title: 'Results',
      path: '/parent/results',
      icon: 'FiAward',
    },
    {
      title: 'Fees',
      path: '/parent/fees',
      icon: 'FiDollarSign',
    },
    {
      title: 'Notifications',
      path: '/parent/notifications',
      icon: 'FiBell',
    },
  ],
};

// Get navigation for role
export function getNavigationForRole(role) {
  return navigationConfig[role] || [];
}

// Dashboard routes by role
export const dashboardRoutes = {
  super_admin: '/admin/dashboard',
  school_admin: '/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
  accountant: '/accountant/dashboard',
  librarian: '/librarian/dashboard',
};

// Get dashboard route for role
export function getDashboardRoute(role) {
  return dashboardRoutes[role] || '/dashboard';
}
