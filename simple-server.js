const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (for development only)
const users = [];
const dailyReports = [];

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, pregnancyWeeks } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password: hashedPassword,
      currentWeek: parseInt(pregnancyWeeks)
    };
    
    users.push(user);
    
    const token = jwt.sign({ userId: user.id }, 'secret');
    res.status(201).json({ 
      token, 
      user: { id: user.id, name, email, currentWeek: user.currentWeek } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, 'secret');
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email, currentWeek: user.currentWeek } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});