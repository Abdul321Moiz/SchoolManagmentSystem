const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse, getGrade, calculatePercentage } = require('../utils/helpers');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Student = require('../models/Student');

// @desc    Get results
// @route   GET /api/v1/results
// @access  Private
exports.getResults = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, examId, classId, studentId, academicYear } = req.query;

  let query = { school: req.user.school };

  if (examId) query.exam = examId;
  if (classId) query.class = classId;
  if (studentId) query.student = studentId;
  if (academicYear) query.academicYear = academicYear;

  // For students, only show their own results
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      query.student = student._id;
    }
  }

  const total = await Result.countDocuments(query);
  const results = await Result.find(query)
    .populate('exam', 'name type')
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('class', 'name')
    .populate('subjects.subject', 'name code')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: results,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single result
// @route   GET /api/v1/results/:id
// @access  Private
exports.getResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('exam', 'name type term academicYear gradeSystem')
    .populate({
      path: 'student',
      populate: [
        { path: 'user', select: 'firstName lastName email avatar' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' }
      ]
    })
    .populate('subjects.subject', 'name code fullMarks passingMarks');

  if (!result) {
    throw new NotFoundError('Result not found');
  }

  if (result.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Result not found');
  }

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Create/Update result
// @route   POST /api/v1/results
// @access  Private/Teacher/Admin
exports.createResult = asyncHandler(async (req, res) => {
  const { examId, studentId, subjects } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Process subjects and calculate grades
  const processedSubjects = subjects.map(sub => {
    const obtained = (sub.theoryMarks?.obtained || 0) + (sub.practicalMarks?.obtained || 0);
    const total = (sub.theoryMarks?.total || 100) + (sub.practicalMarks?.total || 0);
    const percentage = calculatePercentage(obtained, total);
    const gradeInfo = getGrade(parseFloat(percentage));
    const passingMarks = sub.passingMarks || 33;
    
    return {
      ...sub,
      totalMarks: { obtained, total },
      percentage,
      grade: gradeInfo.grade,
      gpa: gradeInfo.gpa,
      isPassed: percentage >= passingMarks,
      enteredBy: req.user._id,
      enteredAt: new Date()
    };
  });

  // Check if result already exists
  let result = await Result.findOne({
    exam: examId,
    student: studentId
  });

  if (result) {
    // Update existing result
    result.subjects = processedSubjects;
    await result.save();
  } else {
    // Create new result
    result = await Result.create({
      school: req.user.school,
      exam: examId,
      student: studentId,
      class: student.class,
      section: student.section,
      academicYear: exam.academicYear,
      subjects: processedSubjects
    });
  }

  // Calculate overall grade
  const gradeInfo = getGrade(parseFloat(result.percentage));
  result.grade = gradeInfo.grade;
  result.gpa = gradeInfo.gpa;
  await result.save();

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Bulk create/update results
// @route   POST /api/v1/results/bulk
// @access  Private/Admin
exports.bulkCreateResults = asyncHandler(async (req, res) => {
  const { examId, results } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  const processedResults = [];

  for (const resultData of results) {
    const student = await Student.findById(resultData.studentId);
    if (!student) continue;

    const processedSubjects = resultData.subjects.map(sub => {
      const obtained = (sub.theoryMarks?.obtained || 0) + (sub.practicalMarks?.obtained || 0);
      const total = (sub.theoryMarks?.total || 100) + (sub.practicalMarks?.total || 0);
      const percentage = calculatePercentage(obtained, total);
      const gradeInfo = getGrade(parseFloat(percentage));
      
      return {
        ...sub,
        totalMarks: { obtained, total },
        percentage,
        grade: gradeInfo.grade,
        gpa: gradeInfo.gpa,
        isPassed: percentage >= 33,
        enteredBy: req.user._id,
        enteredAt: new Date()
      };
    });

    const result = await Result.findOneAndUpdate(
      { exam: examId, student: resultData.studentId },
      {
        school: req.user.school,
        exam: examId,
        student: resultData.studentId,
        class: student.class,
        section: student.section,
        academicYear: exam.academicYear,
        subjects: processedSubjects
      },
      { upsert: true, new: true }
    );

    const gradeInfo = getGrade(parseFloat(result.percentage));
    result.grade = gradeInfo.grade;
    result.gpa = gradeInfo.gpa;
    await result.save();

    processedResults.push(result);
  }

  res.status(201).json({
    success: true,
    message: `${processedResults.length} results processed`,
    data: processedResults
  });
});

// @desc    Calculate class ranks
// @route   POST /api/v1/results/calculate-ranks/:examId
// @access  Private/Admin
exports.calculateRanks = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const results = await Result.find({
    school: req.user.school,
    exam: examId
  }).sort({ percentage: -1 });

  // Calculate overall rank
  for (let i = 0; i < results.length; i++) {
    results[i].rank = i + 1;
    await results[i].save();
  }

  // Calculate class ranks
  const classwiseResults = {};
  results.forEach(r => {
    const classId = r.class.toString();
    if (!classwiseResults[classId]) {
      classwiseResults[classId] = [];
    }
    classwiseResults[classId].push(r);
  });

  for (const classId in classwiseResults) {
    const classResults = classwiseResults[classId].sort((a, b) => b.percentage - a.percentage);
    for (let i = 0; i < classResults.length; i++) {
      classResults[i].classRank = i + 1;
      await classResults[i].save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Ranks calculated successfully'
  });
});

// @desc    Get student's all results
// @route   GET /api/v1/results/student/:studentId
// @access  Private
exports.getStudentResults = asyncHandler(async (req, res) => {
  let studentId = req.params.studentId;

  // If student role, get their student record
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    studentId = student._id;
  }

  const results = await Result.find({
    school: req.user.school,
    student: studentId,
    isPublished: true
  })
    .populate('exam', 'name type term academicYear')
    .populate('subjects.subject', 'name code')
    .sort({ 'exam.academicYear': -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: results
  });
});

// @desc    Get result statistics by class
// @route   GET /api/v1/results/statistics/class/:classId
// @access  Private
exports.getClassResultStatistics = asyncHandler(async (req, res) => {
  const { examId } = req.query;

  let matchQuery = {
    school: req.user.school,
    class: req.params.classId
  };

  if (examId) {
    matchQuery.exam = examId;
  }

  const stats = await Result.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$exam',
        totalStudents: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$result', 'fail'] }, 1, 0] } },
        avgPercentage: { $avg: '$percentage' },
        highestPercentage: { $max: '$percentage' },
        lowestPercentage: { $min: '$percentage' }
      }
    },
    {
      $lookup: {
        from: 'exams',
        localField: '_id',
        foreignField: '_id',
        as: 'exam'
      }
    },
    { $unwind: '$exam' },
    { $sort: { 'exam.startDate': -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});
