const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const seedData = async () => {
  console.log('Seeding database with sample data...');
  
  // Add sample users, reports, etc.
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const sampleUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-0123',
    password: hashedPassword,
    pregnancyStartDate: new Date('2024-01-01'),
    currentWeek: 20
  };
  
  console.log('Sample data created. Run: node seed-database.js');
  process.exit(0);
};

seedData();