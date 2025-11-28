const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { BadRequestError } = require('../utils/ApiError');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload directory based on file type
    if (file.fieldname === 'avatar' || file.fieldname === 'photo') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'assignment') {
      uploadPath += 'assignments/';
    } else if (file.fieldname === 'logo' || file.fieldname === 'banner') {
      uploadPath += 'schools/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  if (file.fieldname === 'avatar' || file.fieldname === 'photo' || 
      file.fieldname === 'logo' || file.fieldname === 'banner') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files are allowed'), false);
    }
  } else if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('File type not allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Upload middleware functions
const uploadSingle = (fieldName) => upload.single(fieldName);

const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

const uploadFields = (fields) => upload.fields(fields);

// Avatar upload
const uploadAvatar = upload.single('avatar');

// Document upload
const uploadDocument = upload.single('document');

// Multiple documents
const uploadDocuments = upload.array('documents', 10);

// School logo and banner
const uploadSchoolImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Assignment attachments
const uploadAssignmentFiles = upload.array('attachments', 5);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadAvatar,
  uploadDocument,
  uploadDocuments,
  uploadSchoolImages,
  uploadAssignmentFiles
};
