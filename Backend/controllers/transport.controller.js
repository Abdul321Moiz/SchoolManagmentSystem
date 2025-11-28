const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse } = require('../utils/helpers');
const { Route, Vehicle, TransportAssignment } = require('../models/Transport');

// VEHICLES

// @desc    Get vehicles
// @route   GET /api/v1/transport/vehicles
// @access  Private/Admin
exports.getVehicles = asyncHandler(async (req, res) => {
  const { status, type } = req.query;

  let query = { school: req.user.school };
  if (status) query.status = status;
  if (type) query.type = type;

  const vehicles = await Vehicle.find(query)
    .populate('driver', 'firstName lastName phone')
    .sort({ vehicleNumber: 1 });

  res.status(200).json({
    success: true,
    data: vehicles
  });
});

// @desc    Get vehicle by ID
// @route   GET /api/v1/transport/vehicles/:id
// @access  Private/Admin
exports.getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('driver', 'firstName lastName phone email')
    .populate('assignedRoutes');

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  // Get assigned students count
  const assignedStudents = await TransportAssignment.countDocuments({
    vehicle: vehicle._id,
    status: 'active'
  });

  res.status(200).json({
    success: true,
    data: {
      ...vehicle.toObject(),
      assignedStudents
    }
  });
});

// @desc    Add vehicle
// @route   POST /api/v1/transport/vehicles
// @access  Private/Admin
exports.addVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create({
    ...req.body,
    school: req.user.school
  });

  res.status(201).json({
    success: true,
    data: vehicle
  });
});

// @desc    Update vehicle
// @route   PUT /api/v1/transport/vehicles/:id
// @access  Private/Admin
exports.updateVehicle = asyncHandler(async (req, res) => {
  let vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  if (vehicle.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Vehicle not found');
  }

  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

// @desc    Delete vehicle
// @route   DELETE /api/v1/transport/vehicles/:id
// @access  Private/Admin
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  // Check for active assignments
  const activeAssignments = await TransportAssignment.countDocuments({
    vehicle: vehicle._id,
    status: 'active'
  });

  if (activeAssignments > 0) {
    throw new BadRequestError('Cannot delete vehicle with active assignments');
  }

  await vehicle.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted successfully'
  });
});

// ROUTES

// @desc    Get routes
// @route   GET /api/v1/transport/routes
// @access  Private
exports.getRoutes = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = { school: req.user.school };
  if (status) query.status = status;

  const routes = await Route.find(query)
    .populate('vehicle', 'vehicleNumber type capacity')
    .populate('driver', 'firstName lastName phone')
    .sort({ routeName: 1 });

  res.status(200).json({
    success: true,
    data: routes
  });
});

// @desc    Get route by ID
// @route   GET /api/v1/transport/routes/:id
// @access  Private
exports.getRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id)
    .populate('vehicle', 'vehicleNumber type capacity')
    .populate('driver', 'firstName lastName phone email');

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  // Get students on this route
  const assignments = await TransportAssignment.find({
    route: route._id,
    status: 'active'
  }).populate({
    path: 'student',
    populate: [
      { path: 'user', select: 'firstName lastName' },
      { path: 'class', select: 'name' }
    ]
  });

  res.status(200).json({
    success: true,
    data: {
      ...route.toObject(),
      students: assignments.map(a => ({
        ...a.student.toObject(),
        pickupPoint: a.pickupPoint,
        dropPoint: a.dropPoint
      }))
    }
  });
});

// @desc    Create route
// @route   POST /api/v1/transport/routes
// @access  Private/Admin
exports.createRoute = asyncHandler(async (req, res) => {
  const route = await Route.create({
    ...req.body,
    school: req.user.school
  });

  // Update vehicle with route assignment
  if (req.body.vehicle) {
    await Vehicle.findByIdAndUpdate(req.body.vehicle, {
      $addToSet: { assignedRoutes: route._id }
    });
  }

  res.status(201).json({
    success: true,
    data: route
  });
});

// @desc    Update route
// @route   PUT /api/v1/transport/routes/:id
// @access  Private/Admin
exports.updateRoute = asyncHandler(async (req, res) => {
  let route = await Route.findById(req.params.id);

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  if (route.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Route not found');
  }

  // Handle vehicle change
  if (req.body.vehicle && req.body.vehicle !== route.vehicle?.toString()) {
    // Remove from old vehicle
    if (route.vehicle) {
      await Vehicle.findByIdAndUpdate(route.vehicle, {
        $pull: { assignedRoutes: route._id }
      });
    }
    // Add to new vehicle
    await Vehicle.findByIdAndUpdate(req.body.vehicle, {
      $addToSet: { assignedRoutes: route._id }
    });
  }

  route = await Route.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: route
  });
});

// @desc    Delete route
// @route   DELETE /api/v1/transport/routes/:id
// @access  Private/Admin
exports.deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  // Check for active assignments
  const activeAssignments = await TransportAssignment.countDocuments({
    route: route._id,
    status: 'active'
  });

  if (activeAssignments > 0) {
    throw new BadRequestError('Cannot delete route with active assignments');
  }

  // Remove from vehicle
  if (route.vehicle) {
    await Vehicle.findByIdAndUpdate(route.vehicle, {
      $pull: { assignedRoutes: route._id }
    });
  }

  await route.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Route deleted successfully'
  });
});

// @desc    Add stop to route
// @route   POST /api/v1/transport/routes/:id/stops
// @access  Private/Admin
exports.addStop = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  route.stops.push(req.body);
  await route.save();

  res.status(200).json({
    success: true,
    data: route
  });
});

// @desc    Update stop
// @route   PUT /api/v1/transport/routes/:id/stops/:stopId
// @access  Private/Admin
exports.updateStop = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  const stopIndex = route.stops.findIndex(s => s._id.toString() === req.params.stopId);
  if (stopIndex === -1) {
    throw new NotFoundError('Stop not found');
  }

  route.stops[stopIndex] = { ...route.stops[stopIndex].toObject(), ...req.body };
  await route.save();

  res.status(200).json({
    success: true,
    data: route
  });
});

// @desc    Remove stop
// @route   DELETE /api/v1/transport/routes/:id/stops/:stopId
// @access  Private/Admin
exports.removeStop = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  route.stops = route.stops.filter(s => s._id.toString() !== req.params.stopId);
  await route.save();

  res.status(200).json({
    success: true,
    data: route
  });
});

// TRANSPORT ASSIGNMENTS

// @desc    Assign transport to student
// @route   POST /api/v1/transport/assign
// @access  Private/Admin
exports.assignTransport = asyncHandler(async (req, res) => {
  const { studentId, routeId, vehicleId, pickupPoint, dropPoint, fee, startDate } = req.body;

  const route = await Route.findById(routeId);
  if (!route) {
    throw new NotFoundError('Route not found');
  }

  // Check vehicle capacity
  const currentAssignments = await TransportAssignment.countDocuments({
    vehicle: vehicleId,
    status: 'active'
  });

  const vehicle = await Vehicle.findById(vehicleId);
  if (currentAssignments >= vehicle.capacity) {
    throw new BadRequestError('Vehicle is at full capacity');
  }

  // Check if already assigned
  const existingAssignment = await TransportAssignment.findOne({
    student: studentId,
    status: 'active'
  });

  if (existingAssignment) {
    throw new BadRequestError('Student already has an active transport assignment');
  }

  const assignment = await TransportAssignment.create({
    school: req.user.school,
    student: studentId,
    route: routeId,
    vehicle: vehicleId,
    pickupPoint,
    dropPoint,
    fee: fee || route.monthlyFee,
    startDate: startDate || new Date()
  });

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Get transport assignments
// @route   GET /api/v1/transport/assignments
// @access  Private/Admin
exports.getAssignments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, routeId, vehicleId, status } = req.query;

  let query = { school: req.user.school };
  if (routeId) query.route = routeId;
  if (vehicleId) query.vehicle = vehicleId;
  if (status) query.status = status;

  const total = await TransportAssignment.countDocuments(query);
  const assignments = await TransportAssignment.find(query)
    .populate({
      path: 'student',
      populate: [
        { path: 'user', select: 'firstName lastName' },
        { path: 'class', select: 'name' }
      ]
    })
    .populate('route', 'routeName')
    .populate('vehicle', 'vehicleNumber')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: assignments,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Update assignment
// @route   PUT /api/v1/transport/assignments/:id
// @access  Private/Admin
exports.updateAssignment = asyncHandler(async (req, res) => {
  let assignment = await TransportAssignment.findById(req.params.id);

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  assignment = await TransportAssignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Cancel assignment
// @route   DELETE /api/v1/transport/assignments/:id
// @access  Private/Admin
exports.cancelAssignment = asyncHandler(async (req, res) => {
  const assignment = await TransportAssignment.findById(req.params.id);

  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  assignment.status = 'cancelled';
  assignment.endDate = new Date();
  await assignment.save();

  res.status(200).json({
    success: true,
    message: 'Transport assignment cancelled'
  });
});

// @desc    Get student transport info
// @route   GET /api/v1/transport/student/:studentId
// @access  Private
exports.getStudentTransport = asyncHandler(async (req, res) => {
  const assignment = await TransportAssignment.findOne({
    student: req.params.studentId,
    status: 'active'
  })
    .populate({
      path: 'route',
      populate: { path: 'driver', select: 'firstName lastName phone' }
    })
    .populate('vehicle', 'vehicleNumber type driverName driverPhone');

  if (!assignment) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No active transport assignment'
    });
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Get transport statistics
// @route   GET /api/v1/transport/statistics
// @access  Private/Admin
exports.getTransportStatistics = asyncHandler(async (req, res) => {
  const totalVehicles = await Vehicle.countDocuments({ school: req.user.school });
  const activeVehicles = await Vehicle.countDocuments({
    school: req.user.school,
    status: 'active'
  });

  const totalRoutes = await Route.countDocuments({ school: req.user.school });
  const activeRoutes = await Route.countDocuments({
    school: req.user.school,
    status: 'active'
  });

  const totalAssignments = await TransportAssignment.countDocuments({
    school: req.user.school,
    status: 'active'
  });

  const vehicleCapacity = await Vehicle.aggregate([
    { $match: { school: req.user.school, status: 'active' } },
    { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } }
  ]);

  const monthlyRevenue = await TransportAssignment.aggregate([
    { $match: { school: req.user.school, status: 'active' } },
    { $group: { _id: null, totalFee: { $sum: '$fee' } } }
  ]);

  const routeWiseStudents = await TransportAssignment.aggregate([
    { $match: { school: req.user.school, status: 'active' } },
    { $group: { _id: '$route', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'routes',
        localField: '_id',
        foreignField: '_id',
        as: 'routeInfo'
      }
    },
    { $unwind: '$routeInfo' },
    {
      $project: {
        routeName: '$routeInfo.routeName',
        count: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalVehicles,
      activeVehicles,
      totalRoutes,
      activeRoutes,
      totalAssignments,
      totalCapacity: vehicleCapacity[0]?.totalCapacity || 0,
      utilizationRate: vehicleCapacity[0]?.totalCapacity 
        ? Math.round((totalAssignments / vehicleCapacity[0].totalCapacity) * 100) 
        : 0,
      monthlyRevenue: monthlyRevenue[0]?.totalFee || 0,
      routeWiseStudents
    }
  });
});
