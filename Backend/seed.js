const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/osms')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Define User Schema inline for seeding
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['super_admin', 'school_admin', 'teacher', 'student', 'parent', 'accountant'],
    default: 'student'
  },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Define School Schema inline for seeding
const schoolSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  type: {
    type: String,
    enum: ['primary', 'secondary', 'higher_secondary', 'college', 'university', 'vocational', 'other'],
    default: 'secondary'
  },
  isActive: { type: Boolean, default: true },
  stats: {
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
    totalClasses: { type: Number, default: 0 }
  }
}, { timestamps: true });

const School = mongoose.model('School', schoolSchema);

async function seedDatabase() {
  try {
    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'superadmin@osms.com' });
    if (existingAdmin) {
      console.log('Super admin already exists');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Create super admin
      const superAdmin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@osms.com',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        isVerified: true
      });
      console.log('Super Admin created:', superAdmin.email);
    }

    // Check if demo school exists
    let school = await School.findOne({ code: 'DEMO001' });
    if (!school) {
      school = await School.create({
        name: 'Demo School',
        code: 'DEMO001',
        email: 'admin@school.com',
        phone: '123-456-7890',
        address: {
          street: '123 Education Street',
          city: 'Learning City',
          state: 'Knowledge State',
          zipCode: '12345',
          country: 'USA'
        },
        type: 'secondary',
        isActive: true
      });
      console.log('Demo School created:', school.name);
    } else {
      console.log('Demo School already exists');
    }

    // Create school admin if not exists
    const existingSchoolAdmin = await User.findOne({ email: 'admin@school.com' });
    if (!existingSchoolAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const schoolAdmin = await User.create({
        firstName: 'School',
        lastName: 'Admin',
        email: 'admin@school.com',
        password: hashedPassword,
        role: 'school_admin',
        school: school._id,
        isActive: true,
        isVerified: true
      });
      console.log('School Admin created:', schoolAdmin.email);
    } else {
      console.log('School Admin already exists');
    }

    // Create teacher if not exists
    const existingTeacher = await User.findOne({ email: 'teacher@school.com' });
    if (!existingTeacher) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const teacher = await User.create({
        firstName: 'John',
        lastName: 'Teacher',
        email: 'teacher@school.com',
        password: hashedPassword,
        role: 'teacher',
        school: school._id,
        isActive: true,
        isVerified: true
      });
      console.log('Teacher created:', teacher.email);
    } else {
      console.log('Teacher already exists');
    }

    // Create student if not exists
    const existingStudent = await User.findOne({ email: 'student@school.com' });
    if (!existingStudent) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const student = await User.create({
        firstName: 'Jane',
        lastName: 'Student',
        email: 'student@school.com',
        password: hashedPassword,
        role: 'student',
        school: school._id,
        isActive: true,
        isVerified: true
      });
      console.log('Student created:', student.email);
    } else {
      console.log('Student already exists');
    }

    console.log('\n=== Demo Credentials ===');
    console.log('Super Admin: superadmin@osms.com / password123');
    console.log('School Admin: admin@school.com / password123');
    console.log('Teacher: teacher@school.com / password123');
    console.log('Student: student@school.com / password123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
