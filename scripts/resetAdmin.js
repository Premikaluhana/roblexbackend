require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

async function resetAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/roblox');
    console.log('Connected to MongoDB');

    // Delete existing admin
    await Admin.deleteOne({ username: 'admin' });
    console.log('Deleted existing admin user');

    // Create new admin with plain password
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('Generated salt:', salt);
    console.log('Hashed password:', hashedPassword);

    const admin = new Admin({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin created successfully:', {
      id: admin._id,
      username: admin.username,
      role: admin.role
    });

    // Test password verification
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Password verification test:', isMatch);
    console.log('Test password:', testPassword);
    console.log('Stored hash:', hashedPassword);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin(); 