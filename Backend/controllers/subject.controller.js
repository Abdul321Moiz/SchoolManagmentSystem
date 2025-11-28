const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { Subject, Syllabus } = require('../models/Subject');
const { Class } = require('../models/Class');
const Teacher = require('../models/Teacher');

// SUBJECTS

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private
exports.getSubjects = asyncHandler(async (req, res) => {
  const { classId, type, teacherId } = req.query;

  let query = { school: req.user.school };
  if (classId) query.class = classId;
  if (type) query.type = type;
  if (teacherId) query.teachers = teacherId;

  const subjects = await Subject.find(query)
    .populate('class', 'name')
    .populate('teachers', 'user')
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: subjects
  });
});

// @desc    Get subject by ID
// @route   GET /api/v1/subjects/:id
// @access  Private
exports.getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate('class', 'name')
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'firstName lastName email' }
    });

  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  // Get syllabus if exists
  const syllabus = await Syllabus.find({ subject: subject._id });

  res.status(200).json({
    success: true,
    data: {
      ...subject.toObject(),
      syllabus
    }
  });
});

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private/Admin
exports.createSubject = asyncHandler(async (req, res) => {
  const { name, code, classId, type, teachers, description, maxMarks, passingMarks } = req.body;

  // Check for duplicate code
  const existing = await Subject.findOne({
    school: req.user.school,
    code: code.toUpperCase()
  });

  if (existing) {
    throw new BadRequestError('Subject code already exists');
  }

  const subject = await Subject.create({
    name,
    code: code.toUpperCase(),
    school: req.user.school,
    class: classId,
    type: type || 'mandatory',
    teachers: teachers || [],
    description,
    maxMarks: maxMarks || 100,
    passingMarks: passingMarks || 33
  });

  const populatedSubject = await Subject.findById(subject._id)
    .populate('class', 'name')
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(201).json({
    success: true,
    data: populatedSubject
  });
});

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private/Admin
exports.updateSubject = asyncHandler(async (req, res) => {
  let subject = await Subject.findById(req.params.id);

  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  if (subject.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Subject not found');
  }

  // Check code uniqueness if being changed
  if (req.body.code && req.body.code.toUpperCase() !== subject.code) {
    const existing = await Subject.findOne({
      school: req.user.school,
      code: req.body.code.toUpperCase(),
      _id: { $ne: subject._id }
    });
    if (existing) {
      throw new BadRequestError('Subject code already exists');
    }
  }

  if (req.body.code) req.body.code = req.body.code.toUpperCase();
  if (req.body.classId) req.body.class = req.body.classId;

  subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('class', 'name')
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(200).json({
    success: true,
    data: subject
  });
});

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
exports.deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  if (subject.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Subject not found');
  }

  // Delete associated syllabus
  await Syllabus.deleteMany({ subject: subject._id });

  await subject.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Subject deleted successfully'
  });
});

// @desc    Assign teacher to subject
// @route   POST /api/v1/subjects/:id/teachers
// @access  Private/Admin
exports.assignTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.body;

  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  if (!subject.teachers.includes(teacherId)) {
    subject.teachers.push(teacherId);
    await subject.save();
  }

  // Add subject to teacher's profile
  if (!teacher.subjects.includes(subject._id)) {
    teacher.subjects.push(subject._id);
    await teacher.save();
  }

  const updatedSubject = await Subject.findById(subject._id)
    .populate('class', 'name')
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(200).json({
    success: true,
    data: updatedSubject
  });
});

// @desc    Remove teacher from subject
// @route   DELETE /api/v1/subjects/:id/teachers/:teacherId
// @access  Private/Admin
exports.removeTeacher = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  subject.teachers = subject.teachers.filter(
    t => t.toString() !== req.params.teacherId
  );
  await subject.save();

  // Remove subject from teacher's profile
  const teacher = await Teacher.findById(req.params.teacherId);
  if (teacher) {
    teacher.subjects = teacher.subjects.filter(
      s => s.toString() !== subject._id.toString()
    );
    await teacher.save();
  }

  const updatedSubject = await Subject.findById(subject._id)
    .populate('class', 'name')
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(200).json({
    success: true,
    data: updatedSubject
  });
});

// @desc    Get subjects by class
// @route   GET /api/v1/subjects/class/:classId
// @access  Private
exports.getSubjectsByClass = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({
    school: req.user.school,
    class: req.params.classId,
    isActive: true
  })
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: subjects
  });
});

// SYLLABUS

// @desc    Get syllabus for subject
// @route   GET /api/v1/subjects/:id/syllabus
// @access  Private
exports.getSyllabus = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  const syllabus = await Syllabus.find({ subject: subject._id })
    .sort({ order: 1 });

  res.status(200).json({
    success: true,
    data: syllabus
  });
});

// @desc    Create syllabus chapter/unit
// @route   POST /api/v1/subjects/:id/syllabus
// @access  Private/Admin/Teacher
exports.createSyllabus = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  const { title, description, topics, duration, order, resources } = req.body;

  const syllabus = await Syllabus.create({
    school: req.user.school,
    subject: subject._id,
    class: subject.class,
    academicYear: req.body.academicYear || new Date().getFullYear().toString(),
    title,
    description,
    topics: topics || [],
    duration,
    order: order || 0,
    resources: resources || [],
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: syllabus
  });
});

// @desc    Update syllabus chapter/unit
// @route   PUT /api/v1/subjects/:subjectId/syllabus/:syllabusId
// @access  Private/Admin/Teacher
exports.updateSyllabus = asyncHandler(async (req, res) => {
  let syllabus = await Syllabus.findById(req.params.syllabusId);

  if (!syllabus) {
    throw new NotFoundError('Syllabus not found');
  }

  syllabus = await Syllabus.findByIdAndUpdate(req.params.syllabusId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: syllabus
  });
});

// @desc    Delete syllabus chapter/unit
// @route   DELETE /api/v1/subjects/:subjectId/syllabus/:syllabusId
// @access  Private/Admin/Teacher
exports.deleteSyllabus = asyncHandler(async (req, res) => {
  const syllabus = await Syllabus.findById(req.params.syllabusId);

  if (!syllabus) {
    throw new NotFoundError('Syllabus not found');
  }

  await syllabus.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Syllabus chapter deleted successfully'
  });
});

// @desc    Update syllabus completion
// @route   PUT /api/v1/subjects/:subjectId/syllabus/:syllabusId/completion
// @access  Private/Teacher
exports.updateSyllabusCompletion = asyncHandler(async (req, res) => {
  const { status, completionDate, remarks } = req.body;

  let syllabus = await Syllabus.findById(req.params.syllabusId);

  if (!syllabus) {
    throw new NotFoundError('Syllabus not found');
  }

  syllabus.status = status;
  if (completionDate) syllabus.completionDate = new Date(completionDate);
  if (remarks) syllabus.remarks = remarks;
  syllabus.updatedBy = req.user._id;

  await syllabus.save();

  res.status(200).json({
    success: true,
    data: syllabus
  });
});

// @desc    Get syllabus completion report
// @route   GET /api/v1/subjects/syllabus-report
// @access  Private/Admin
exports.getSyllabusReport = asyncHandler(async (req, res) => {
  const { classId, academicYear } = req.query;

  let matchQuery = { school: req.user.school };
  if (classId) matchQuery.class = classId;
  if (academicYear) matchQuery.academicYear = academicYear;

  const report = await Syllabus.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$subject',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        notStarted: { $sum: { $cond: [{ $eq: ['$status', 'not_started'] }, 1, 0] } }
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subjectInfo'
      }
    },
    { $unwind: '$subjectInfo' },
    {
      $project: {
        subjectName: '$subjectInfo.name',
        subjectCode: '$subjectInfo.code',
        total: 1,
        completed: 1,
        inProgress: 1,
        notStarted: 1,
        completionPercentage: {
          $multiply: [{ $divide: ['$completed', '$total'] }, 100]
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: report
  });
});

// @desc    Bulk create subjects
// @route   POST /api/v1/subjects/bulk
// @access  Private/Admin
exports.bulkCreateSubjects = asyncHandler(async (req, res) => {
  const { subjects, classId } = req.body;

  const created = [];
  const errors = [];

  for (const subj of subjects) {
    try {
      const existing = await Subject.findOne({
        school: req.user.school,
        code: subj.code.toUpperCase()
      });

      if (existing) {
        errors.push({ code: subj.code, error: 'Already exists' });
        continue;
      }

      const subject = await Subject.create({
        ...subj,
        code: subj.code.toUpperCase(),
        school: req.user.school,
        class: classId || subj.classId
      });

      created.push(subject);
    } catch (err) {
      errors.push({ code: subj.code, error: err.message });
    }
  }

  res.status(201).json({
    success: true,
    data: {
      created: created.length,
      errors: errors.length,
      subjects: created,
      failedSubjects: errors
    }
  });
});
