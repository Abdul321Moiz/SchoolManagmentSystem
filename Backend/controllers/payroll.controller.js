const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse, generateInvoiceNumber } = require('../utils/helpers');
const { SalaryStructure, PayrollRecord } = require('../models/Payroll');
const Teacher = require('../models/Teacher');

// SALARY STRUCTURES

// @desc    Get salary structures
// @route   GET /api/v1/payroll/structures
// @access  Private/Admin
exports.getSalaryStructures = asyncHandler(async (req, res) => {
  const structures = await SalaryStructure.find({ school: req.user.school })
    .sort({ grade: 1 });

  res.status(200).json({
    success: true,
    data: structures
  });
});

// @desc    Create salary structure
// @route   POST /api/v1/payroll/structures
// @access  Private/Admin
exports.createSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await SalaryStructure.create({
    ...req.body,
    school: req.user.school
  });

  res.status(201).json({
    success: true,
    data: structure
  });
});

// @desc    Update salary structure
// @route   PUT /api/v1/payroll/structures/:id
// @access  Private/Admin
exports.updateSalaryStructure = asyncHandler(async (req, res) => {
  let structure = await SalaryStructure.findById(req.params.id);

  if (!structure) {
    throw new NotFoundError('Salary structure not found');
  }

  if (structure.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Salary structure not found');
  }

  structure = await SalaryStructure.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: structure
  });
});

// @desc    Delete salary structure
// @route   DELETE /api/v1/payroll/structures/:id
// @access  Private/Admin
exports.deleteSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await SalaryStructure.findById(req.params.id);

  if (!structure) {
    throw new NotFoundError('Salary structure not found');
  }

  await structure.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Salary structure deleted successfully'
  });
});

// PAYROLL RECORDS

// @desc    Get payroll records
// @route   GET /api/v1/payroll/records
// @access  Private/Admin/Accountant
exports.getPayrollRecords = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, month, year, employeeType, status } = req.query;

  let query = { school: req.user.school };
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (employeeType) query.employeeType = employeeType;
  if (status) query.status = status;

  const total = await PayrollRecord.countDocuments(query);
  const records = await PayrollRecord.find(query)
    .populate('employee', 'firstName lastName employeeId email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: records,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get payroll record
// @route   GET /api/v1/payroll/records/:id
// @access  Private
exports.getPayrollRecord = asyncHandler(async (req, res) => {
  const record = await PayrollRecord.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeId email phone')
    .populate('processedBy', 'firstName lastName');

  if (!record) {
    throw new NotFoundError('Payroll record not found');
  }

  res.status(200).json({
    success: true,
    data: record
  });
});

// @desc    Generate payroll
// @route   POST /api/v1/payroll/generate
// @access  Private/Admin
exports.generatePayroll = asyncHandler(async (req, res) => {
  const { month, year, employeeIds, employeeType } = req.body;

  // Get employees
  let employees = [];
  
  if (employeeIds && employeeIds.length > 0) {
    const User = require('../models/User');
    employees = await User.find({
      _id: { $in: employeeIds },
      school: req.user.school,
      status: 'active'
    });
  } else if (employeeType === 'teacher') {
    employees = await Teacher.find({
      school: req.user.school,
      status: 'active'
    }).populate('user', 'firstName lastName email');
  }

  const generatedRecords = [];

  for (const emp of employees) {
    // Check if already generated
    const existing = await PayrollRecord.findOne({
      school: req.user.school,
      employee: emp.user ? emp.user._id : emp._id,
      month,
      year
    });

    if (existing) continue;

    // Get salary structure
    const salaryGrade = emp.salaryGrade || 'A';
    const structure = await SalaryStructure.findOne({
      school: req.user.school,
      grade: salaryGrade
    });

    if (!structure) continue;

    // Calculate salary components
    const basicSalary = structure.basicSalary;
    
    const earnings = structure.allowances.map(a => ({
      name: a.name,
      amount: a.type === 'percentage' ? (basicSalary * a.value / 100) : a.value
    }));

    const deductions = structure.deductions.map(d => ({
      name: d.name,
      amount: d.type === 'percentage' ? (basicSalary * d.value / 100) : d.value
    }));

    const totalEarnings = basicSalary + earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const netSalary = totalEarnings - totalDeductions;

    const record = await PayrollRecord.create({
      payrollNumber: generateInvoiceNumber('PAY'),
      school: req.user.school,
      employee: emp.user ? emp.user._id : emp._id,
      employeeType: employeeType || 'teacher',
      month,
      year,
      basicSalary,
      earnings,
      deductions,
      totalEarnings,
      totalDeductions,
      netSalary,
      generatedBy: req.user._id
    });

    generatedRecords.push(record);
  }

  res.status(201).json({
    success: true,
    message: `${generatedRecords.length} payroll records generated`,
    data: generatedRecords
  });
});

// @desc    Update payroll record
// @route   PUT /api/v1/payroll/records/:id
// @access  Private/Admin
exports.updatePayrollRecord = asyncHandler(async (req, res) => {
  let record = await PayrollRecord.findById(req.params.id);

  if (!record) {
    throw new NotFoundError('Payroll record not found');
  }

  if (record.status === 'paid') {
    throw new BadRequestError('Cannot modify paid payroll record');
  }

  const { earnings, deductions, remarks } = req.body;

  if (earnings) {
    record.earnings = earnings;
    record.totalEarnings = record.basicSalary + earnings.reduce((sum, e) => sum + e.amount, 0);
  }

  if (deductions) {
    record.deductions = deductions;
    record.totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  }

  if (remarks) record.remarks = remarks;

  record.netSalary = record.totalEarnings - record.totalDeductions;
  await record.save();

  res.status(200).json({
    success: true,
    data: record
  });
});

// @desc    Process payroll (approve/reject)
// @route   PUT /api/v1/payroll/records/:id/process
// @access  Private/Admin
exports.processPayroll = asyncHandler(async (req, res) => {
  const { status } = req.body;

  let record = await PayrollRecord.findById(req.params.id);

  if (!record) {
    throw new NotFoundError('Payroll record not found');
  }

  if (!['approved', 'rejected'].includes(status)) {
    throw new BadRequestError('Invalid status');
  }

  record.status = status;
  record.processedBy = req.user._id;
  record.processedAt = new Date();
  await record.save();

  res.status(200).json({
    success: true,
    data: record
  });
});

// @desc    Mark payroll as paid
// @route   PUT /api/v1/payroll/records/:id/pay
// @access  Private/Admin/Accountant
exports.markPaid = asyncHandler(async (req, res) => {
  const { paymentMethod, transactionId, remarks } = req.body;

  let record = await PayrollRecord.findById(req.params.id);

  if (!record) {
    throw new NotFoundError('Payroll record not found');
  }

  if (record.status !== 'approved') {
    throw new BadRequestError('Only approved payroll can be marked as paid');
  }

  record.status = 'paid';
  record.paymentMethod = paymentMethod;
  record.transactionId = transactionId;
  record.paymentDate = new Date();
  record.paidBy = req.user._id;
  if (remarks) record.remarks = remarks;
  await record.save();

  res.status(200).json({
    success: true,
    data: record
  });
});

// @desc    Bulk process payroll
// @route   PUT /api/v1/payroll/bulk-process
// @access  Private/Admin
exports.bulkProcess = asyncHandler(async (req, res) => {
  const { recordIds, status } = req.body;

  if (!recordIds || recordIds.length === 0) {
    throw new BadRequestError('No records provided');
  }

  const result = await PayrollRecord.updateMany(
    {
      _id: { $in: recordIds },
      school: req.user.school,
      status: { $in: ['pending', 'approved'] }
    },
    {
      status,
      processedBy: req.user._id,
      processedAt: new Date()
    }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} records processed`,
    modifiedCount: result.modifiedCount
  });
});

// @desc    Get payroll statistics
// @route   GET /api/v1/payroll/statistics
// @access  Private/Admin
exports.getPayrollStatistics = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const matchQuery = { school: req.user.school };
  if (year) matchQuery.year = parseInt(year);

  const summary = await PayrollRecord.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalNetSalary: { $sum: '$netSalary' },
        totalPaid: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$netSalary', 0] }
        },
        totalPending: {
          $sum: { $cond: [{ $in: ['$status', ['pending', 'approved']] }, '$netSalary', 0] }
        }
      }
    }
  ]);

  const monthlyBreakdown = await PayrollRecord.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        totalAmount: { $sum: '$netSalary' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const statusBreakdown = await PayrollRecord.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        amount: { $sum: '$netSalary' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: summary[0] || {
        totalRecords: 0,
        totalNetSalary: 0,
        totalPaid: 0,
        totalPending: 0
      },
      monthlyBreakdown,
      statusBreakdown
    }
  });
});

// @desc    Get employee payslips
// @route   GET /api/v1/payroll/employee/:employeeId/payslips
// @access  Private
exports.getEmployeePayslips = asyncHandler(async (req, res) => {
  const { year } = req.query;

  let query = {
    school: req.user.school,
    employee: req.params.employeeId
  };

  if (year) query.year = parseInt(year);

  const payslips = await PayrollRecord.find(query)
    .select('-school')
    .sort({ year: -1, month: -1 });

  const totalEarned = payslips
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.netSalary, 0);

  res.status(200).json({
    success: true,
    data: {
      payslips,
      totalEarned,
      payslipCount: payslips.length
    }
  });
});
