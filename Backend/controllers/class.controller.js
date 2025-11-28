const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse } = require('../utils/helpers');
const { Class, Section } = require('../models/Class');
const School = require('../models/School');

// @desc    Get all classes
// @route   GET /api/v1/classes
// @access  Private
exports.getClasses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, academicYear, isActive } = req.query;

  let query = { school: req.user.school };
  
  if (academicYear) query.academicYear = academicYear;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const total = await Class.countDocuments(query);
  const classes = await Class.find(query)
    .populate('classTeacher', 'user')
    .populate('sections')
    .populate('subjects', 'name code')
    .sort({ numericValue: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: classes,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single class
// @route   GET /api/v1/classes/:id
// @access  Private
exports.getClass = asyncHandler(async (req, res) => {
  const classDoc = await Class.findById(req.params.id)
    .populate('classTeacher')
    .populate('sections')
    .populate('subjects', 'name code type')
    .populate('feeStructure');

  if (!classDoc) {
    throw new NotFoundError('Class not found');
  }

  if (classDoc.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Class not found');
  }

  res.status(200).json({
    success: true,
    data: classDoc
  });
});

// @desc    Create class
// @route   POST /api/v1/classes
// @access  Private/Admin
exports.createClass = asyncHandler(async (req, res) => {
  const { name, numericValue, academicYear, description, roomNumber, capacity, subjects } = req.body;

  // Check if class already exists
  const existingClass = await Class.findOne({
    school: req.user.school,
    name,
    academicYear
  });

  if (existingClass) {
    throw new BadRequestError('Class with this name already exists for this academic year');
  }

  const classDoc = await Class.create({
    name,
    numericValue,
    academicYear,
    description,
    roomNumber,
    capacity,
    subjects,
    school: req.user.school
  });

  // Update school stats
  await School.findByIdAndUpdate(req.user.school, {
    $inc: { 'stats.totalClasses': 1 }
  });

  res.status(201).json({
    success: true,
    data: classDoc
  });
});

// @desc    Update class
// @route   PUT /api/v1/classes/:id
// @access  Private/Admin
exports.updateClass = asyncHandler(async (req, res) => {
  let classDoc = await Class.findById(req.params.id);

  if (!classDoc) {
    throw new NotFoundError('Class not found');
  }

  if (classDoc.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Class not found');
  }

  classDoc = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: classDoc
  });
});

// @desc    Delete class
// @route   DELETE /api/v1/classes/:id
// @access  Private/Admin
exports.deleteClass = asyncHandler(async (req, res) => {
  const classDoc = await Class.findById(req.params.id);

  if (!classDoc) {
    throw new NotFoundError('Class not found');
  }

  if (classDoc.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Class not found');
  }

  // Delete all sections
  await Section.deleteMany({ class: classDoc._id });

  await classDoc.deleteOne();

  // Update school stats
  await School.findByIdAndUpdate(req.user.school, {
    $inc: { 'stats.totalClasses': -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Class deleted successfully'
  });
});

// SECTIONS

// @desc    Get sections for a class
// @route   GET /api/v1/classes/:classId/sections
// @access  Private
exports.getSections = asyncHandler(async (req, res) => {
  const sections = await Section.find({
    school: req.user.school,
    class: req.params.classId
  })
    .populate('classTeacher')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: sections
  });
});

// @desc    Create section
// @route   POST /api/v1/classes/:classId/sections
// @access  Private/Admin
exports.createSection = asyncHandler(async (req, res) => {
  const { name, capacity, roomNumber, classTeacher } = req.body;

  // Check if class exists
  const classDoc = await Class.findById(req.params.classId);
  if (!classDoc) {
    throw new NotFoundError('Class not found');
  }

  // Check if section already exists
  const existingSection = await Section.findOne({
    school: req.user.school,
    class: req.params.classId,
    name
  });

  if (existingSection) {
    throw new BadRequestError('Section with this name already exists in this class');
  }

  const section = await Section.create({
    name,
    capacity,
    roomNumber,
    classTeacher,
    class: req.params.classId,
    school: req.user.school
  });

  res.status(201).json({
    success: true,
    data: section
  });
});

// @desc    Update section
// @route   PUT /api/v1/classes/:classId/sections/:sectionId
// @access  Private/Admin
exports.updateSection = asyncHandler(async (req, res) => {
  let section = await Section.findById(req.params.sectionId);

  if (!section) {
    throw new NotFoundError('Section not found');
  }

  if (section.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Section not found');
  }

  section = await Section.findByIdAndUpdate(req.params.sectionId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: section
  });
});

// @desc    Delete section
// @route   DELETE /api/v1/classes/:classId/sections/:sectionId
// @access  Private/Admin
exports.deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.sectionId);

  if (!section) {
    throw new NotFoundError('Section not found');
  }

  if (section.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Section not found');
  }

  await section.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Section deleted successfully'
  });
});
