const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse } = require('../utils/helpers');
const { Assignment, AssignmentSubmission } = require('../models/Assignment');
const Student = require('../models/Student');

// @desc    Get assignments
// @route   GET /api/v1/assignments
// @access  Private
exports.getAssignments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, classId, subjectId, status, teacherId } = req.query;

  let query = { school: req.user.school };

  if (classId) query.class = classId;
  if (subjectId) query.subject = subjectId;
  if (status) query.status = status;
  if (teacherId) query.teacher = teacherId;

  // For students, only show their class assignments
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      query.class = student.class;
      query.status = 'published';
    }
  }

  // For teachers, show their assignments
  if (req.user.role === 'teacher') {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (teacher) {
      query.teacher = teacher._id;
    }
  }

  const total = await Assignment.countDocuments(query);
  const assignments = await Assignment.find(query)
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('subject', 'name code')
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: assignments,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single assignment
// @route   GET /api/v1/assignments/:id
// @access  Private
exports.getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('subject', 'name code')
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'firstName lastName email' }
    });

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  if (assignment.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Assignment not found');
  }

  // Get submission count
  const submissionCount = await AssignmentSubmission.countDocuments({
    assignment: assignment._id
  });

  res.status(200).json({
    success: true,
    data: {
      ...assignment.toObject(),
      submissionCount
    }
  });
});

// @desc    Create assignment
// @route   POST /api/v1/assignments
// @access  Private/Teacher
exports.createAssignment = asyncHandler(async (req, res) => {
  const Teacher = require('../models/Teacher');
  
  let teacherId = req.body.teacher;
  
  // If teacher role, get their teacher record
  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      throw new BadRequestError('Teacher profile not found');
    }
    teacherId = teacher._id;
  }

  const assignment = await Assignment.create({
    ...req.body,
    school: req.user.school,
    teacher: teacherId
  });

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/v1/assignments/:id
// @access  Private/Teacher
exports.updateAssignment = asyncHandler(async (req, res) => {
  let assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  if (assignment.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Assignment not found');
  }

  // Teachers can only edit their own assignments
  if (req.user.role === 'teacher') {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (assignment.teacher.toString() !== teacher._id.toString()) {
      throw new BadRequestError('You can only edit your own assignments');
    }
  }

  assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Private/Teacher/Admin
exports.deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  if (assignment.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Assignment not found');
  }

  // Delete all submissions
  await AssignmentSubmission.deleteMany({ assignment: assignment._id });

  await assignment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Publish assignment
// @route   PATCH /api/v1/assignments/:id/publish
// @access  Private/Teacher
exports.publishAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  assignment.status = 'published';
  assignment.publishedAt = new Date();
  await assignment.save();

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// SUBMISSIONS

// @desc    Get submissions for an assignment
// @route   GET /api/v1/assignments/:id/submissions
// @access  Private/Teacher
exports.getSubmissions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  let query = { assignment: req.params.id };
  if (status) query.status = status;

  const total = await AssignmentSubmission.countDocuments(query);
  const submissions = await AssignmentSubmission.find(query)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName avatar' }
    })
    .sort({ submittedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: submissions,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Submit assignment (Student)
// @route   POST /api/v1/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  if (assignment.status !== 'published') {
    throw new BadRequestError('Assignment is not published');
  }

  // Get student record
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    throw new BadRequestError('Student profile not found');
  }

  // Check if already submitted
  const existingSubmission = await AssignmentSubmission.findOne({
    assignment: assignment._id,
    student: student._id
  });

  if (existingSubmission && !existingSubmission.resubmissionAllowed) {
    throw new BadRequestError('You have already submitted this assignment');
  }

  // Check due date
  const now = new Date();
  let isLate = false;
  
  if (now > assignment.dueDate) {
    if (!assignment.allowLateSubmission) {
      throw new BadRequestError('Assignment submission deadline has passed');
    }
    if (assignment.lateSubmissionDeadline && now > assignment.lateSubmissionDeadline) {
      throw new BadRequestError('Late submission deadline has also passed');
    }
    isLate = true;
  }

  if (existingSubmission && existingSubmission.resubmissionAllowed) {
    // Add to resubmissions
    existingSubmission.resubmissions.push({
      content: req.body.content,
      attachments: req.body.attachments,
      submittedAt: new Date()
    });
    existingSubmission.status = 'submitted';
    await existingSubmission.save();

    return res.status(200).json({
      success: true,
      data: existingSubmission
    });
  }

  const submission = await AssignmentSubmission.create({
    assignment: assignment._id,
    student: student._id,
    school: req.user.school,
    content: req.body.content,
    attachments: req.body.attachments,
    isLate
  });

  res.status(201).json({
    success: true,
    data: submission
  });
});

// @desc    Grade submission
// @route   PATCH /api/v1/assignments/submissions/:submissionId/grade
// @access  Private/Teacher
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const { marks, feedback, resubmissionAllowed, resubmissionDeadline } = req.body;

  const submission = await AssignmentSubmission.findById(req.params.submissionId);

  if (!submission) {
    throw new NotFoundError('Submission not found');
  }

  const assignment = await Assignment.findById(submission.assignment);

  // Calculate percentage and apply late penalty
  let obtainedMarks = marks;
  if (submission.isLate && assignment.lateSubmissionPenalty > 0) {
    obtainedMarks = marks * (1 - assignment.lateSubmissionPenalty / 100);
  }

  const percentage = (obtainedMarks / assignment.totalMarks) * 100;

  // Determine grade
  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B+';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 40) grade = 'D';

  const Teacher = require('../models/Teacher');
  const teacher = await Teacher.findOne({ user: req.user._id });

  submission.marks = {
    obtained: obtainedMarks,
    total: assignment.totalMarks
  };
  submission.percentage = percentage;
  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = 'graded';
  submission.gradedBy = teacher?._id;
  submission.gradedAt = new Date();
  submission.resubmissionAllowed = resubmissionAllowed || false;
  submission.resubmissionDeadline = resubmissionDeadline;

  await submission.save();

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get student's submission for an assignment
// @route   GET /api/v1/assignments/:id/my-submission
// @access  Private/Student
exports.getMySubmission = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    throw new NotFoundError('Student profile not found');
  }

  const submission = await AssignmentSubmission.findOne({
    assignment: req.params.id,
    student: student._id
  });

  res.status(200).json({
    success: true,
    data: submission
  });
});
