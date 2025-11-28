const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse } = require('../utils/helpers');
const Exam = require('../models/Exam');
const Result = require('../models/Result');

// @desc    Get all exams
// @route   GET /api/v1/exams
// @access  Private
exports.getExams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, academicYear, type, status, classId } = req.query;

  let query = { school: req.user.school };

  if (academicYear) query.academicYear = academicYear;
  if (type) query.type = type;
  if (status) query.status = status;
  if (classId) query.classes = classId;

  const total = await Exam.countDocuments(query);
  const exams = await Exam.find(query)
    .populate('classes', 'name')
    .populate('createdBy', 'firstName lastName')
    .sort({ startDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: exams,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single exam
// @route   GET /api/v1/exams/:id
// @access  Private
exports.getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate('classes', 'name numericValue')
    .populate('schedule.subject', 'name code')
    .populate('schedule.class', 'name')
    .populate('schedule.invigilators', 'user')
    .populate('createdBy', 'firstName lastName');

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Exam not found');
  }

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Create exam
// @route   POST /api/v1/exams
// @access  Private/Admin
exports.createExam = asyncHandler(async (req, res) => {
  req.body.school = req.user.school;
  req.body.createdBy = req.user._id;

  const exam = await Exam.create(req.body);

  res.status(201).json({
    success: true,
    data: exam
  });
});

// @desc    Update exam
// @route   PUT /api/v1/exams/:id
// @access  Private/Admin
exports.updateExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.resultsPublished) {
    throw new BadRequestError('Cannot modify exam after results are published');
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Delete exam
// @route   DELETE /api/v1/exams/:id
// @access  Private/Admin
exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Exam not found');
  }

  // Delete all results for this exam
  await Result.deleteMany({ exam: exam._id });

  await exam.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Exam deleted successfully'
  });
});

// @desc    Add exam schedule
// @route   POST /api/v1/exams/:id/schedule
// @access  Private/Admin
exports.addExamSchedule = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Exam not found');
  }

  exam.schedule.push(req.body);
  await exam.save();

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Update exam status
// @route   PATCH /api/v1/exams/:id/status
// @access  Private/Admin
exports.updateExamStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Exam not found');
  }

  exam.status = status;
  await exam.save();

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Publish exam results
// @route   PATCH /api/v1/exams/:id/publish-results
// @access  Private/Admin
exports.publishResults = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Exam not found');
  }

  // Update all results for this exam
  await Result.updateMany(
    { exam: exam._id },
    { isPublished: true, publishedAt: new Date() }
  );

  exam.resultsPublished = true;
  exam.publishedAt = new Date();
  exam.publishedBy = req.user._id;
  await exam.save();

  res.status(200).json({
    success: true,
    message: 'Results published successfully',
    data: exam
  });
});

// @desc    Get exam statistics
// @route   GET /api/v1/exams/:id/statistics
// @access  Private
exports.getExamStatistics = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  const stats = await Result.aggregate([
    { $match: { exam: exam._id } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$result', 'fail'] }, 1, 0] } },
        avgPercentage: { $avg: '$percentage' },
        highestPercentage: { $max: '$percentage' },
        lowestPercentage: { $min: '$percentage' }
      }
    }
  ]);

  const gradeDistribution = await Result.aggregate([
    { $match: { exam: exam._id } },
    { $group: { _id: '$grade', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...stats[0],
      gradeDistribution,
      passPercentage: stats[0] 
        ? ((stats[0].passed / stats[0].totalStudents) * 100).toFixed(2) 
        : 0
    }
  });
});
