const mongoose = require('mongoose');

// Transport Route Schema
const transportRouteSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    trim: true
  },
  description: String,
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  helper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stops: [{
    name: String,
    address: String,
    landmark: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    pickupTime: String,
    dropTime: String,
    fare: Number,
    order: Number
  }],
  startPoint: {
    name: String,
    address: String,
    departureTime: String
  },
  endPoint: {
    name: String,
    address: String,
    arrivalTime: String
  },
  totalDistance: Number, // in km
  estimatedDuration: Number, // in minutes
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
transportRouteSchema.index({ school: 1, routeNumber: 1 }, { unique: true });
transportRouteSchema.index({ school: 1, status: 1 });

const TransportRoute = mongoose.model('TransportRoute', transportRouteSchema);

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['bus', 'van', 'car', 'other'],
    default: 'bus'
  },
  make: String,
  model: String,
  year: Number,
  color: String,
  capacity: {
    type: Number,
    required: [true, 'Vehicle capacity is required']
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'petrol', 'cng', 'electric'],
    default: 'diesel'
  },
  registrationDate: Date,
  registrationExpiry: Date,
  insuranceNumber: String,
  insuranceExpiry: Date,
  fitnessExpiry: Date,
  pollutionExpiry: Date,
  gpsDevice: {
    deviceId: String,
    isInstalled: { type: Boolean, default: false }
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  helper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportRoute'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired'],
    default: 'active'
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    expiryDate: Date
  }],
  maintenanceHistory: [{
    date: Date,
    type: String,
    description: String,
    cost: Number,
    vendor: String,
    nextDueDate: Date
  }]
}, {
  timestamps: true
});

// Indexes
vehicleSchema.index({ school: 1, vehicleNumber: 1 }, { unique: true });
vehicleSchema.index({ school: 1, status: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Transport Fee Schema
const transportFeeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportRoute'
  },
  stopFees: [{
    stopName: String,
    monthlyFee: Number,
    quarterlyFee: Number,
    yearlyFee: Number
  }],
  defaultFee: {
    monthly: { type: Number, default: 0 },
    quarterly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index
transportFeeSchema.index({ school: 1, academicYear: 1 });

const TransportFee = mongoose.model('TransportFee', transportFeeSchema);

module.exports = { TransportRoute, Vehicle, TransportFee };
