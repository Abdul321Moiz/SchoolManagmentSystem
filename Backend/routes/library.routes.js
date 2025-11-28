const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getIssues,
  renewBook,
  reserveBook,
  cancelReservation,
  getReservations,
  payFine,
  getLibraryStatistics,
  getUserLibraryHistory
} = require('../controllers/library.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Books
router.route('/books')
  .get(getBooks)
  .post(authorize('super_admin', 'school_admin', 'librarian'), addBook);

router.route('/books/:id')
  .get(getBook)
  .put(authorize('super_admin', 'school_admin', 'librarian'), updateBook)
  .delete(authorize('super_admin', 'school_admin', 'librarian'), deleteBook);

// Issue & Return
router.post('/issue', authorize('super_admin', 'school_admin', 'librarian'), issueBook);
router.put('/return/:issueId', authorize('super_admin', 'school_admin', 'librarian'), returnBook);
router.get('/issues', getIssues);
router.put('/renew/:issueId', renewBook);

// Reservations
router.route('/reserve')
  .post(reserveBook);
router.delete('/reserve/:id', cancelReservation);
router.get('/reservations', getReservations);

// Fines
router.put('/issues/:issueId/pay-fine', authorize('super_admin', 'school_admin', 'librarian'), payFine);

// Statistics & History
router.get('/statistics', authorize('super_admin', 'school_admin', 'librarian'), getLibraryStatistics);
router.get('/user/:userId/history', getUserLibraryHistory);

module.exports = router;
