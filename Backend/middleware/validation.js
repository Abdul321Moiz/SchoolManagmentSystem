const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/ApiError');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    throw new ValidationError('Validation failed', errorMessages);
  }
  next();
};

// Common validation rules
const commonValidations = {
  mongoId: (field, location = 'param') => {
    const validator = location === 'param' ? param(field) : 
                      location === 'body' ? body(field) : query(field);
    return validator
      .trim()
      .isMongoId()
      .withMessage(`Invalid ${field} ID`);
  },

  email: (field = 'email') => 
    body(field)
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),

  password: (field = 'password') =>
    body(field)
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),

  phone: (field = 'phone') =>
    body(field)
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)]+$/)
      .withMessage('Please provide a valid phone number'),

  name: (field) =>
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`)
      .isLength({ min: 2, max: 50 })
      .withMessage(`${field} must be between 2 and 50 characters`),

  date: (field) =>
    body(field)
      .notEmpty()
      .withMessage(`${field} is required`)
      .isISO8601()
      .withMessage(`Please provide a valid date for ${field}`),

  optionalDate: (field) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`Please provide a valid date for ${field}`),

  number: (field, min = 0) =>
    body(field)
      .isNumeric()
      .withMessage(`${field} must be a number`)
      .custom(value => value >= min)
      .withMessage(`${field} must be at least ${min}`),

  optionalNumber: (field, min = 0) =>
    body(field)
      .optional()
      .isNumeric()
      .withMessage(`${field} must be a number`)
      .custom(value => value >= min)
      .withMessage(`${field} must be at least ${min}`),

  enum: (field, values) =>
    body(field)
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`),

  optionalEnum: (field, values) =>
    body(field)
      .optional()
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`),

  boolean: (field) =>
    body(field)
      .optional()
      .isBoolean()
      .withMessage(`${field} must be a boolean`),

  array: (field) =>
    body(field)
      .isArray()
      .withMessage(`${field} must be an array`),

  optionalArray: (field) =>
    body(field)
      .optional()
      .isArray()
      .withMessage(`${field} must be an array`),

  string: (field, maxLength = 500) =>
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`)
      .isLength({ max: maxLength })
      .withMessage(`${field} cannot exceed ${maxLength} characters`),

  optionalString: (field, maxLength = 500) =>
    body(field)
      .optional()
      .trim()
      .isLength({ max: maxLength })
      .withMessage(`${field} cannot exceed ${maxLength} characters`)
};

// Auth validations
const authValidations = {
  register: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.enum('role', ['school_admin', 'teacher', 'student', 'parent', 'accountant']),
    commonValidations.phone(),
    validate
  ],

  login: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],

  forgotPassword: [
    commonValidations.email(),
    validate
  ],

  resetPassword: [
    commonValidations.password(),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    validate
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    commonValidations.password('newPassword'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match'),
    validate
  ]
};

// School validations
const schoolValidations = {
  create: [
    commonValidations.string('name', 200),
    body('code')
      .trim()
      .notEmpty()
      .withMessage('School code is required')
      .isLength({ max: 10 })
      .withMessage('School code cannot exceed 10 characters'),
    commonValidations.email('email'),
    commonValidations.phone('phone'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.zipCode').notEmpty().withMessage('ZIP code is required'),
    commonValidations.enum('type', ['primary', 'secondary', 'higher_secondary', 'college', 'university', 'vocational', 'other']),
    validate
  ],

  update: [
    commonValidations.optionalString('name', 200),
    commonValidations.phone('phone'),
    validate
  ]
};

// Student validations
const studentValidations = {
  create: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email(),
    commonValidations.mongoId('class', 'body'),
    commonValidations.date('dateOfBirth'),
    commonValidations.enum('gender', ['male', 'female', 'other']),
    validate
  ],

  update: [
    commonValidations.mongoId('id', 'param'),
    validate
  ]
};

// Teacher validations
const teacherValidations = {
  create: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email(),
    commonValidations.date('dateOfBirth'),
    commonValidations.enum('gender', ['male', 'female', 'other']),
    commonValidations.string('qualification', 200),
    commonValidations.enum('designation', ['principal', 'vice_principal', 'head_teacher', 'senior_teacher', 'teacher', 'assistant_teacher', 'trainee']),
    validate
  ]
};

// Class validations
const classValidations = {
  create: [
    commonValidations.string('name', 50),
    commonValidations.number('numericValue', 1),
    commonValidations.string('academicYear', 20),
    validate
  ]
};

// Subject validations
const subjectValidations = {
  create: [
    commonValidations.string('name', 100),
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Subject code is required')
      .isLength({ max: 10 })
      .withMessage('Subject code cannot exceed 10 characters'),
    commonValidations.optionalEnum('type', ['compulsory', 'elective', 'optional', 'extra_curricular']),
    validate
  ]
};

// Attendance validations
const attendanceValidations = {
  mark: [
    commonValidations.mongoId('class', 'body'),
    commonValidations.date('date'),
    body('students')
      .isArray({ min: 1 })
      .withMessage('Students array is required'),
    body('students.*.student')
      .isMongoId()
      .withMessage('Invalid student ID'),
    body('students.*.status')
      .isIn(['present', 'absent', 'late', 'half_day', 'excused'])
      .withMessage('Invalid attendance status'),
    validate
  ]
};

// Exam validations
const examValidations = {
  create: [
    commonValidations.string('name', 100),
    commonValidations.enum('type', ['unit_test', 'quarterly', 'half_yearly', 'annual', 'practice', 'entrance', 'other']),
    commonValidations.date('startDate'),
    commonValidations.date('endDate'),
    commonValidations.array('classes'),
    validate
  ]
};

// Assignment validations
const assignmentValidations = {
  create: [
    commonValidations.string('title', 200),
    body('description').notEmpty().withMessage('Description is required'),
    commonValidations.mongoId('class', 'body'),
    commonValidations.mongoId('subject', 'body'),
    commonValidations.date('dueDate'),
    validate
  ]
};

// Fee validations
const feeValidations = {
  createStructure: [
    commonValidations.string('name', 100),
    commonValidations.string('academicYear', 20),
    body('feeComponents')
      .isArray({ min: 1 })
      .withMessage('At least one fee component is required'),
    validate
  ],

  createInvoice: [
    commonValidations.mongoId('student', 'body'),
    commonValidations.date('dueDate'),
    validate
  ],

  recordPayment: [
    commonValidations.mongoId('invoice', 'body'),
    commonValidations.number('amount', 0),
    commonValidations.enum('paymentMethod', ['cash', 'card', 'bank_transfer', 'cheque', 'online', 'upi', 'other']),
    validate
  ]
};

// Pagination validations
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .trim(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  validate
];

// Combined validation rules for easy access in routes
const validationRules = {
  // Auth
  register: authValidations.register,
  login: authValidations.login,
  forgotPassword: authValidations.forgotPassword,
  resetPassword: authValidations.resetPassword,
  changePassword: authValidations.changePassword,
  
  // School
  createSchool: schoolValidations.create,
  updateSchool: schoolValidations.update,
  
  // Student
  createStudent: studentValidations.create,
  updateStudent: studentValidations.update,
  
  // Teacher
  createTeacher: teacherValidations.create,
  updateTeacher: teacherValidations.update,
  
  // Class
  createClass: classValidations.create,
  updateClass: classValidations.update,
  
  // Subject
  createSubject: subjectValidations.create,
  updateSubject: subjectValidations.update,
  
  // Attendance
  createAttendance: attendanceValidations.create,
  bulkAttendance: attendanceValidations.bulk,
  
  // Exam
  createExam: examValidations.create,
  updateExam: examValidations.update,
  
  // Assignment
  createAssignment: assignmentValidations.create,
  updateAssignment: assignmentValidations.update,
  submitAssignment: assignmentValidations.submit,
  gradeAssignment: assignmentValidations.grade,
  
  // Fee
  createFee: feeValidations.create,
  recordPayment: feeValidations.payment,
  
  // Pagination
  pagination: paginationValidation
};

module.exports = {
  validate,
  validationRules,
  commonValidations,
  authValidations,
  schoolValidations,
  studentValidations,
  teacherValidations,
  classValidations,
  subjectValidations,
  attendanceValidations,
  examValidations,
  assignmentValidations,
  feeValidations,
  paginationValidation
};
