require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const admin = await Admin.findOne({ username: 'admin' });
    if (admin) {
      console.log('Admin found:', {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt
      });
    } else {
      console.log('Admin not found');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAdmin(); 