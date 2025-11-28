const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse, generateInvoiceNumber } = require('../utils/helpers');
const { Book, BookIssue, BookReservation } = require('../models/Library');

// BOOKS

// @desc    Get books
// @route   GET /api/v1/library/books
// @access  Private
exports.getBooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, status, author } = req.query;

  let query = { school: req.user.school };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) query.category = category;
  if (status) query.status = status;
  if (author) query.author = { $regex: author, $options: 'i' };

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .sort({ title: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: books,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get book by ID
// @route   GET /api/v1/library/books/:id
// @access  Private
exports.getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  // Get current issues
  const currentIssues = await BookIssue.find({
    book: book._id,
    status: 'issued'
  }).populate('issuedTo', 'firstName lastName');

  // Get reservations
  const reservations = await BookReservation.find({
    book: book._id,
    status: 'pending'
  }).populate('reservedBy', 'firstName lastName');

  res.status(200).json({
    success: true,
    data: {
      ...book.toObject(),
      currentIssues,
      reservations
    }
  });
});

// @desc    Add book
// @route   POST /api/v1/library/books
// @access  Private/Admin/Librarian
exports.addBook = asyncHandler(async (req, res) => {
  const book = await Book.create({
    ...req.body,
    school: req.user.school,
    addedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: book
  });
});

// @desc    Update book
// @route   PUT /api/v1/library/books/:id
// @access  Private/Admin/Librarian
exports.updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  if (book.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Book not found');
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: book
  });
});

// @desc    Delete book
// @route   DELETE /api/v1/library/books/:id
// @access  Private/Admin/Librarian
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  // Check if book has active issues
  const activeIssues = await BookIssue.countDocuments({
    book: book._id,
    status: 'issued'
  });

  if (activeIssues > 0) {
    throw new BadRequestError('Cannot delete book with active issues');
  }

  await book.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully'
  });
});

// BOOK ISSUES

// @desc    Issue book
// @route   POST /api/v1/library/issue
// @access  Private/Admin/Librarian
exports.issueBook = asyncHandler(async (req, res) => {
  const { bookId, userId, dueDate, remarks } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  if (book.availableCopies <= 0) {
    throw new BadRequestError('No copies available');
  }

  // Check user's current issues
  const userIssues = await BookIssue.countDocuments({
    issuedTo: userId,
    status: 'issued',
    school: req.user.school
  });

  const maxBooks = 5; // Could be from school settings
  if (userIssues >= maxBooks) {
    throw new BadRequestError(`User has already issued maximum ${maxBooks} books`);
  }

  // Check if user already has this book
  const existingIssue = await BookIssue.findOne({
    book: bookId,
    issuedTo: userId,
    status: 'issued'
  });

  if (existingIssue) {
    throw new BadRequestError('User already has this book issued');
  }

  const issue = await BookIssue.create({
    issueNumber: generateInvoiceNumber('LIB'),
    school: req.user.school,
    book: bookId,
    issuedTo: userId,
    issuedBy: req.user._id,
    dueDate: new Date(dueDate),
    remarks
  });

  // Update book availability
  book.availableCopies -= 1;
  await book.save();

  // Cancel any reservation by this user
  await BookReservation.updateOne(
    { book: bookId, reservedBy: userId, status: 'pending' },
    { status: 'fulfilled' }
  );

  const populatedIssue = await BookIssue.findById(issue._id)
    .populate('book', 'title author isbn')
    .populate('issuedTo', 'firstName lastName');

  res.status(201).json({
    success: true,
    data: populatedIssue
  });
});

// @desc    Return book
// @route   PUT /api/v1/library/return/:issueId
// @access  Private/Admin/Librarian
exports.returnBook = asyncHandler(async (req, res) => {
  const { condition, remarks, fineAmount } = req.body;

  const issue = await BookIssue.findById(req.params.issueId)
    .populate('book');

  if (!issue) {
    throw new NotFoundError('Issue record not found');
  }

  if (issue.status !== 'issued') {
    throw new BadRequestError('Book already returned');
  }

  issue.status = 'returned';
  issue.returnDate = new Date();
  issue.returnedTo = req.user._id;
  issue.returnCondition = condition || 'good';
  
  if (remarks) issue.remarks = remarks;
  if (fineAmount) {
    issue.fineAmount = fineAmount;
    issue.fineStatus = 'pending';
  }

  await issue.save();

  // Update book availability
  const book = await Book.findById(issue.book._id);
  book.availableCopies += 1;
  await book.save();

  res.status(200).json({
    success: true,
    data: issue
  });
});

// @desc    Get issued books
// @route   GET /api/v1/library/issues
// @access  Private
exports.getIssues = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, userId, overdue } = req.query;

  let query = { school: req.user.school };
  if (status) query.status = status;
  if (userId) query.issuedTo = userId;
  if (overdue === 'true') {
    query.status = 'issued';
    query.dueDate = { $lt: new Date() };
  }

  // For students, show only their issues
  if (req.user.role === 'student') {
    query.issuedTo = req.user._id;
  }

  const total = await BookIssue.countDocuments(query);
  const issues = await BookIssue.find(query)
    .populate('book', 'title author isbn category')
    .populate('issuedTo', 'firstName lastName email')
    .populate('issuedBy', 'firstName lastName')
    .sort({ issueDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: issues,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Renew book
// @route   PUT /api/v1/library/renew/:issueId
// @access  Private
exports.renewBook = asyncHandler(async (req, res) => {
  const { newDueDate } = req.body;

  const issue = await BookIssue.findById(req.params.issueId);

  if (!issue) {
    throw new NotFoundError('Issue record not found');
  }

  if (issue.status !== 'issued') {
    throw new BadRequestError('Book not currently issued');
  }

  if (issue.renewCount >= 2) {
    throw new BadRequestError('Maximum renewal limit reached');
  }

  // Check if there are pending reservations
  const pendingReservations = await BookReservation.countDocuments({
    book: issue.book,
    status: 'pending'
  });

  if (pendingReservations > 0) {
    throw new BadRequestError('Book has pending reservations and cannot be renewed');
  }

  issue.dueDate = new Date(newDueDate);
  issue.renewCount += 1;
  await issue.save();

  res.status(200).json({
    success: true,
    data: issue
  });
});

// BOOK RESERVATIONS

// @desc    Reserve book
// @route   POST /api/v1/library/reserve
// @access  Private
exports.reserveBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  // Check if already reserved
  const existingReservation = await BookReservation.findOne({
    book: bookId,
    reservedBy: req.user._id,
    status: 'pending'
  });

  if (existingReservation) {
    throw new BadRequestError('You already have a pending reservation for this book');
  }

  // Check if already issued to user
  const existingIssue = await BookIssue.findOne({
    book: bookId,
    issuedTo: req.user._id,
    status: 'issued'
  });

  if (existingIssue) {
    throw new BadRequestError('You already have this book issued');
  }

  const reservation = await BookReservation.create({
    school: req.user.school,
    book: bookId,
    reservedBy: req.user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  res.status(201).json({
    success: true,
    data: reservation
  });
});

// @desc    Cancel reservation
// @route   DELETE /api/v1/library/reserve/:id
// @access  Private
exports.cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await BookReservation.findById(req.params.id);

  if (!reservation) {
    throw new NotFoundError('Reservation not found');
  }

  // Only owner or admin can cancel
  if (reservation.reservedBy.toString() !== req.user._id.toString() && 
      !['super_admin', 'school_admin', 'librarian'].includes(req.user.role)) {
    throw new BadRequestError('Not authorized to cancel this reservation');
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.status(200).json({
    success: true,
    message: 'Reservation cancelled'
  });
});

// @desc    Get reservations
// @route   GET /api/v1/library/reservations
// @access  Private
exports.getReservations = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = { school: req.user.school };
  if (status) query.status = status;

  // For students, show only their reservations
  if (req.user.role === 'student') {
    query.reservedBy = req.user._id;
  }

  const reservations = await BookReservation.find(query)
    .populate('book', 'title author availableCopies')
    .populate('reservedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: reservations
  });
});

// @desc    Pay fine
// @route   PUT /api/v1/library/issues/:issueId/pay-fine
// @access  Private/Admin/Librarian
exports.payFine = asyncHandler(async (req, res) => {
  const { amount, paymentMethod } = req.body;

  const issue = await BookIssue.findById(req.params.issueId);

  if (!issue) {
    throw new NotFoundError('Issue record not found');
  }

  if (!issue.fineAmount || issue.fineAmount === 0) {
    throw new BadRequestError('No fine to pay');
  }

  if (amount < issue.fineAmount) {
    throw new BadRequestError('Payment amount is less than fine amount');
  }

  issue.fineStatus = 'paid';
  issue.finePaidDate = new Date();
  await issue.save();

  res.status(200).json({
    success: true,
    data: issue
  });
});

// @desc    Get library statistics
// @route   GET /api/v1/library/statistics
// @access  Private/Admin/Librarian
exports.getLibraryStatistics = asyncHandler(async (req, res) => {
  const totalBooks = await Book.countDocuments({ school: req.user.school });
  
  const bookStats = await Book.aggregate([
    { $match: { school: req.user.school } },
    {
      $group: {
        _id: null,
        totalCopies: { $sum: '$totalCopies' },
        availableCopies: { $sum: '$availableCopies' }
      }
    }
  ]);

  const categoryBreakdown = await Book.aggregate([
    { $match: { school: req.user.school } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const activeIssues = await BookIssue.countDocuments({
    school: req.user.school,
    status: 'issued'
  });

  const overdueBooks = await BookIssue.countDocuments({
    school: req.user.school,
    status: 'issued',
    dueDate: { $lt: new Date() }
  });

  const pendingReservations = await BookReservation.countDocuments({
    school: req.user.school,
    status: 'pending'
  });

  const pendingFines = await BookIssue.aggregate([
    {
      $match: {
        school: req.user.school,
        fineStatus: 'pending',
        fineAmount: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalFines: { $sum: '$fineAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalBooks,
      totalCopies: bookStats[0]?.totalCopies || 0,
      availableCopies: bookStats[0]?.availableCopies || 0,
      issuedCopies: (bookStats[0]?.totalCopies || 0) - (bookStats[0]?.availableCopies || 0),
      activeIssues,
      overdueBooks,
      pendingReservations,
      pendingFines: pendingFines[0]?.totalFines || 0,
      pendingFineCount: pendingFines[0]?.count || 0,
      categoryBreakdown
    }
  });
});

// @desc    Get user library history
// @route   GET /api/v1/library/user/:userId/history
// @access  Private
exports.getUserLibraryHistory = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const issues = await BookIssue.find({
    school: req.user.school,
    issuedTo: userId
  })
    .populate('book', 'title author isbn')
    .sort({ issueDate: -1 });

  const reservations = await BookReservation.find({
    school: req.user.school,
    reservedBy: userId
  })
    .populate('book', 'title author')
    .sort({ createdAt: -1 });

  const currentlyIssued = issues.filter(i => i.status === 'issued').length;
  const totalReturned = issues.filter(i => i.status === 'returned').length;
  const pendingFines = issues
    .filter(i => i.fineStatus === 'pending')
    .reduce((sum, i) => sum + (i.fineAmount || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      issues,
      reservations,
      summary: {
        currentlyIssued,
        totalReturned,
        pendingFines
      }
    }
  });
});
