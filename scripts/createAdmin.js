require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createAdmin() {
  try {
    // Connect to MongoDB using the same connection string as in your application
    await mongoose.connect('mongodb://localhost:27017/roblox');
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', {
        id: existingAdmin._id,
        username: existingAdmin.username,
        role: existingAdmin.role
      });
      await mongoose.disconnect();
      return;
    }
    
    // Create new admin
    const admin = new Admin({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin created successfully:', {
      id: admin._id,
      username: admin.username,
      role: admin.role
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
  }
}

createAdmin(); 