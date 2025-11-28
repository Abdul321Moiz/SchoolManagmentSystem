const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  addStop,
  updateStop,
  removeStop,
  assignTransport,
  getAssignments,
  updateAssignment,
  cancelAssignment,
  getStudentTransport,
  getTransportStatistics
} = require('../controllers/transport.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Vehicles
router.route('/vehicles')
  .get(authorize('super_admin', 'school_admin', 'transport_manager'), getVehicles)
  .post(authorize('super_admin', 'school_admin', 'transport_manager'), addVehicle);

router.route('/vehicles/:id')
  .get(authorize('super_admin', 'school_admin', 'transport_manager'), getVehicle)
  .put(authorize('super_admin', 'school_admin', 'transport_manager'), updateVehicle)
  .delete(authorize('super_admin', 'school_admin'), deleteVehicle);

// Routes
router.route('/routes')
  .get(getRoutes)
  .post(authorize('super_admin', 'school_admin', 'transport_manager'), createRoute);

router.route('/routes/:id')
  .get(getRoute)
  .put(authorize('super_admin', 'school_admin', 'transport_manager'), updateRoute)
  .delete(authorize('super_admin', 'school_admin'), deleteRoute);

// Route stops
router.post('/routes/:id/stops', authorize('super_admin', 'school_admin', 'transport_manager'), addStop);
router.put('/routes/:id/stops/:stopId', authorize('super_admin', 'school_admin', 'transport_manager'), updateStop);
router.delete('/routes/:id/stops/:stopId', authorize('super_admin', 'school_admin', 'transport_manager'), removeStop);

// Assignments
router.route('/assignments')
  .get(authorize('super_admin', 'school_admin', 'transport_manager'), getAssignments);

router.post('/assign', authorize('super_admin', 'school_admin', 'transport_manager'), assignTransport);

router.route('/assignments/:id')
  .put(authorize('super_admin', 'school_admin', 'transport_manager'), updateAssignment)
  .delete(authorize('super_admin', 'school_admin', 'transport_manager'), cancelAssignment);

// Student transport
router.get('/student/:studentId', getStudentTransport);

// Statistics
router.get('/statistics', authorize('super_admin', 'school_admin', 'transport_manager'), getTransportStatistics);

module.exports = router;
