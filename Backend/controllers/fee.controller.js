const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse, generateInvoiceNumber } = require('../utils/helpers');
const { FeeStructure, FeeInvoice, FeePayment } = require('../models/Fee');
const Student = require('../models/Student');

// FEE STRUCTURE

// @desc    Get fee structures
// @route   GET /api/v1/fees/structures
// @access  Private/Admin
exports.getFeeStructures = asyncHandler(async (req, res) => {
  const { academicYear, classId } = req.query;

  let query = { school: req.user.school };
  if (academicYear) query.academicYear = academicYear;
  if (classId) query.classes = classId;

  const structures = await FeeStructure.find(query)
    .populate('classes', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: structures
  });
});

// @desc    Create fee structure
// @route   POST /api/v1/fees/structures
// @access  Private/Admin
exports.createFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.create({
    ...req.body,
    school: req.user.school
  });

  res.status(201).json({
    success: true,
    data: structure
  });
});

// @desc    Update fee structure
// @route   PUT /api/v1/fees/structures/:id
// @access  Private/Admin
exports.updateFeeStructure = asyncHandler(async (req, res) => {
  let structure = await FeeStructure.findById(req.params.id);

  if (!structure) {
    throw new NotFoundError('Fee structure not found');
  }

  if (structure.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Fee structure not found');
  }

  structure = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: structure
  });
});

// @desc    Delete fee structure
// @route   DELETE /api/v1/fees/structures/:id
// @access  Private/Admin
exports.deleteFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.findById(req.params.id);

  if (!structure) {
    throw new NotFoundError('Fee structure not found');
  }

  if (structure.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Fee structure not found');
  }

  await structure.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Fee structure deleted successfully'
  });
});

// FEE INVOICES

// @desc    Get fee invoices
// @route   GET /api/v1/fees/invoices
// @access  Private
exports.getInvoices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, studentId, status, academicYear, month } = req.query;

  let query = { school: req.user.school };

  if (studentId) query.student = studentId;
  if (status) query.status = status;
  if (academicYear) query.academicYear = academicYear;
  if (month) query.month = parseInt(month);

  // For students/parents, show only their invoices
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (student) query.student = student._id;
  }

  if (req.user.role === 'parent') {
    const Parent = require('../models/Parent');
    const parent = await Parent.findOne({ user: req.user._id });
    if (parent) query.student = { $in: parent.children };
  }

  const total = await FeeInvoice.countDocuments(query);
  const invoices = await FeeInvoice.find(query)
    .populate({
      path: 'student',
      populate: [
        { path: 'user', select: 'firstName lastName' },
        { path: 'class', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: invoices,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single invoice
// @route   GET /api/v1/fees/invoices/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res) => {
  const invoice = await FeeInvoice.findById(req.params.id)
    .populate({
      path: 'student',
      populate: [
        { path: 'user', select: 'firstName lastName email phone' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' }
      ]
    })
    .populate('feeStructure');

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Get payments for this invoice
  const payments = await FeePayment.find({ invoice: invoice._id })
    .sort({ paymentDate: -1 });

  res.status(200).json({
    success: true,
    data: {
      ...invoice.toObject(),
      payments
    }
  });
});

// @desc    Generate invoices
// @route   POST /api/v1/fees/invoices/generate
// @access  Private/Admin
exports.generateInvoices = asyncHandler(async (req, res) => {
  const { classId, month, academicYear, dueDate, feeStructureId } = req.body;

  const feeStructure = await FeeStructure.findById(feeStructureId);
  if (!feeStructure) {
    throw new NotFoundError('Fee structure not found');
  }

  // Get students
  let studentQuery = { school: req.user.school, status: 'active' };
  if (classId) studentQuery.class = classId;

  const students = await Student.find(studentQuery).populate('user', 'firstName lastName');

  const generatedInvoices = [];

  for (const student of students) {
    // Check if invoice already exists
    const existingInvoice = await FeeInvoice.findOne({
      school: req.user.school,
      student: student._id,
      academicYear,
      month
    });

    if (existingInvoice) continue;

    // Calculate items
    const items = feeStructure.feeComponents
      .filter(comp => comp.frequency === 'monthly' || comp.frequency === 'one_time')
      .map(comp => ({
        name: comp.name,
        type: comp.type,
        amount: comp.amount,
        discount: student.scholarshipPercentage ? (comp.amount * student.scholarshipPercentage / 100) : 0,
        finalAmount: comp.amount - (student.scholarshipPercentage ? (comp.amount * student.scholarshipPercentage / 100) : 0)
      }));

    const subtotal = items.reduce((sum, item) => sum + item.finalAmount, 0);

    const invoice = await FeeInvoice.create({
      invoiceNumber: generateInvoiceNumber('FEE'),
      school: req.user.school,
      student: student._id,
      feeStructure: feeStructureId,
      academicYear,
      month,
      items,
      subtotal,
      totalAmount: subtotal,
      dueDate: new Date(dueDate),
      generatedBy: req.user._id
    });

    generatedInvoices.push(invoice);
  }

  res.status(201).json({
    success: true,
    message: `${generatedInvoices.length} invoices generated`,
    data: generatedInvoices
  });
});

// @desc    Update invoice
// @route   PUT /api/v1/fees/invoices/:id
// @access  Private/Admin
exports.updateInvoice = asyncHandler(async (req, res) => {
  let invoice = await FeeInvoice.findById(req.params.id);

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  if (invoice.status === 'paid') {
    throw new BadRequestError('Cannot modify paid invoice');
  }

  invoice = await FeeInvoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// FEE PAYMENTS

// @desc    Record payment
// @route   POST /api/v1/fees/payments
// @access  Private/Admin/Accountant
exports.recordPayment = asyncHandler(async (req, res) => {
  const { invoiceId, amount, paymentMethod, paymentDetails, paidBy, remarks } = req.body;

  const invoice = await FeeInvoice.findById(invoiceId);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  if (amount > invoice.dueAmount) {
    throw new BadRequestError('Payment amount exceeds due amount');
  }

  const payment = await FeePayment.create({
    receiptNumber: generateInvoiceNumber('RCP'),
    school: req.user.school,
    student: invoice.student,
    invoice: invoiceId,
    amount,
    paymentMethod,
    paymentDetails,
    paidBy,
    collectedBy: req.user._id,
    remarks
  });

  // Update invoice
  invoice.paidAmount += amount;
  await invoice.save();

  res.status(201).json({
    success: true,
    data: payment
  });
});

// @desc    Get payments
// @route   GET /api/v1/fees/payments
// @access  Private
exports.getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, studentId, startDate, endDate, paymentMethod } = req.query;

  let query = { school: req.user.school };

  if (studentId) query.student = studentId;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate && endDate) {
    query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const total = await FeePayment.countDocuments(query);
  const payments = await FeePayment.find(query)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('collectedBy', 'firstName lastName')
    .sort({ paymentDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: payments,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get fee statistics
// @route   GET /api/v1/fees/statistics
// @access  Private/Admin
exports.getFeeStatistics = asyncHandler(async (req, res) => {
  const { academicYear, month } = req.query;

  let matchQuery = { school: req.user.school };
  if (academicYear) matchQuery.academicYear = academicYear;
  if (month) matchQuery.month = parseInt(month);

  const invoiceStats = await FeeInvoice.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue: { $sum: '$dueAmount' }
      }
    }
  ]);

  const statusBreakdown = await FeeInvoice.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
  ]);

  const paymentMethodBreakdown = await FeePayment.aggregate([
    { $match: { school: req.user.school } },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: invoiceStats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0
      },
      statusBreakdown,
      paymentMethodBreakdown
    }
  });
});

// @desc    Get student fee summary
// @route   GET /api/v1/fees/student/:studentId/summary
// @access  Private
exports.getStudentFeeSummary = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  const invoices = await FeeInvoice.find({
    school: req.user.school,
    student: studentId
  });

  const totalFee = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.dueAmount, 0);

  res.status(200).json({
    success: true,
    data: {
      totalFee,
      totalPaid,
      totalDue,
      overdueAmount,
      invoiceCount: invoices.length,
      paidCount: invoices.filter(inv => inv.status === 'paid').length,
      pendingCount: invoices.filter(inv => inv.status === 'pending').length,
      overdueCount: invoices.filter(inv => inv.status === 'overdue').length
    }
  });
});
