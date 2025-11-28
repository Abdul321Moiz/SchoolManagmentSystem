const mongoose = require('mongoose');

// Book Schema
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  isbn: {
    type: String,
    trim: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required']
  },
  publisher: String,
  publicationYear: Number,
  edition: String,
  category: {
    type: String,
    enum: ['fiction', 'non_fiction', 'science', 'mathematics', 'history', 'geography', 'literature', 'reference', 'textbook', 'magazine', 'journal', 'other'],
    default: 'other'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: Number,
  description: String,
  coverImage: String,
  location: {
    rack: String,
    shelf: String,
    row: String
  },
  copies: {
    total: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    issued: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 },
    lost: { type: Number, default: 0 }
  },
  price: Number,
  isReferenceOnly: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
bookSchema.index({ school: 1, title: 1 });
bookSchema.index({ school: 1, isbn: 1 });
bookSchema.index({ school: 1, category: 1 });
bookSchema.index({ school: 1, author: 1 });

const Book = mongoose.model('Book', bookSchema);

// Book Issue Schema
const bookIssueSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrower: {
    type: {
      type: String,
      enum: ['student', 'teacher'],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'borrower.type',
      required: true
    }
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: Date,
  renewalCount: {
    type: Number,
    default: 0
  },
  maxRenewals: {
    type: Number,
    default: 2
  },
  fine: {
    amount: { type: Number, default: 0 },
    paid: { type: Boolean, default: false },
    paidDate: Date
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue', 'lost', 'damaged'],
    default: 'issued'
  },
  condition: {
    atIssue: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
    atReturn: { type: String, enum: ['good', 'fair', 'poor', 'damaged', 'lost'] }
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: String
}, {
  timestamps: true
});

// Indexes
bookIssueSchema.index({ school: 1, book: 1 });
bookIssueSchema.index({ school: 1, 'borrower.user': 1 });
bookIssueSchema.index({ status: 1, dueDate: 1 });

// Calculate fine before saving
bookIssueSchema.pre('save', function(next) {
  if (this.returnDate && this.returnDate > this.dueDate) {
    const daysOverdue = Math.ceil((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
    this.fine.amount = daysOverdue * 1; // $1 per day
  }
  next();
});

const BookIssue = mongoose.model('BookIssue', bookIssueSchema);

// Library Settings Schema
const librarySettingsSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    unique: true
  },
  settings: {
    maxBooksPerStudent: { type: Number, default: 3 },
    maxBooksPerTeacher: { type: Number, default: 5 },
    issuePeriodStudent: { type: Number, default: 14 }, // days
    issuePeriodTeacher: { type: Number, default: 30 }, // days
    finePerDay: { type: Number, default: 1 },
    maxRenewals: { type: Number, default: 2 },
    renewalPeriod: { type: Number, default: 7 }, // days
    workingDays: {
      type: [String],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    openingTime: { type: String, default: '08:00' },
    closingTime: { type: String, default: '17:00' }
  }
}, {
  timestamps: true
});

const LibrarySettings = mongoose.model('LibrarySettings', librarySettingsSchema);

module.exports = { Book, BookIssue, LibrarySettings };
