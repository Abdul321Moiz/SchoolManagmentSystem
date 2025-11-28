const crypto = require('crypto');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate student/teacher ID
const generateId = (prefix, count) => {
  const paddedCount = String(count).padStart(6, '0');
  const year = new Date().getFullYear().toString().slice(-2);
  return `${prefix}${year}${paddedCount}`;
};

// Generate admission number
const generateAdmissionNumber = (schoolCode, count) => {
  const paddedCount = String(count).padStart(5, '0');
  const year = new Date().getFullYear();
  return `${schoolCode}/${year}/${paddedCount}`;
};

// Generate invoice number
const generateInvoiceNumber = (prefix = 'INV') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Paginate results
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

// Build pagination response
const paginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

// Filter query builder
const buildFilterQuery = (filters, allowedFields) => {
  const query = {};
  
  Object.keys(filters).forEach(key => {
    if (allowedFields.includes(key) && filters[key] !== undefined && filters[key] !== '') {
      if (typeof filters[key] === 'string' && filters[key].includes(',')) {
        query[key] = { $in: filters[key].split(',') };
      } else {
        query[key] = filters[key];
      }
    }
  });
  
  return query;
};

// Search query builder
const buildSearchQuery = (searchTerm, searchFields) => {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  return {
    $or: searchFields.map(field => ({ [field]: searchRegex }))
  };
};

// Sort query builder
const buildSortQuery = (sortBy = 'createdAt', sortOrder = 'desc') => {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
};

// Calculate percentage
const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return ((obtained / total) * 100).toFixed(2);
};

// Get grade from percentage
const getGrade = (percentage, gradeSystem = 'default') => {
  const gradeSystems = {
    default: [
      { min: 90, grade: 'A+', gpa: 4.0 },
      { min: 80, grade: 'A', gpa: 3.7 },
      { min: 70, grade: 'B+', gpa: 3.3 },
      { min: 60, grade: 'B', gpa: 3.0 },
      { min: 50, grade: 'C+', gpa: 2.7 },
      { min: 40, grade: 'C', gpa: 2.3 },
      { min: 33, grade: 'D', gpa: 2.0 },
      { min: 0, grade: 'F', gpa: 0 }
    ]
  };

  const system = gradeSystems[gradeSystem] || gradeSystems.default;
  const gradeInfo = system.find(g => percentage >= g.min);
  return gradeInfo || { grade: 'F', gpa: 0 };
};

// Sanitize object (remove undefined/null values)
const sanitizeObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
};

// Generate time slots
const generateTimeSlots = (startTime, endTime, duration = 60) => {
  const slots = [];
  let current = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);

  while (current < end) {
    const slotStart = current.toTimeString().slice(0, 5);
    current = new Date(current.getTime() + duration * 60000);
    const slotEnd = current.toTimeString().slice(0, 5);
    
    if (current <= end) {
      slots.push({ start: slotStart, end: slotEnd });
    }
  }

  return slots;
};

// Academic year helper
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Assuming academic year starts in April
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
};

module.exports = {
  generateRandomString,
  generateId,
  generateAdmissionNumber,
  generateInvoiceNumber,
  formatDate,
  calculateAge,
  paginate,
  paginationResponse,
  buildFilterQuery,
  buildSearchQuery,
  buildSortQuery,
  calculatePercentage,
  getGrade,
  sanitizeObject,
  generateTimeSlots,
  getCurrentAcademicYear
};
