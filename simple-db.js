const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage
let users = [];
let dailyReports = [];
let chatHistory = [];
let userIdCounter = 1;

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, pregnancyWeeks } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const pregnancyStartDate = new Date();
    pregnancyStartDate.setDate(pregnancyStartDate.getDate() - (pregnancyWeeks * 7));
    
    const user = {
      id: userIdCounter++,
      name,
      email,
      phone,
      password: hashedPassword,
      pregnancyStartDate,
      currentWeek: pregnancyWeeks,
      createdAt: new Date()
    };
    
    users.push(user);
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ token, user: { id: user.id, name, email, currentWeek: pregnancyWeeks } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed: ' + error.message });
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
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, name: user.name, email, currentWeek: user.currentWeek } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.post('/api/daily-report', authenticateToken, (req, res) => {
  const reportData = { ...req.body, userId: req.user.userId, id: Date.now() };
  
  let healthScore = 100;
  if (reportData.bloodPressure?.systolic > 140 || reportData.bloodPressure?.diastolic > 90) healthScore -= 20;
  if (reportData.bloodSugar > 140) healthScore -= 15;
  if (reportData.mood === 'stressed' || reportData.mood === 'anxious') healthScore -= 10;
  
  reportData.healthScore = Math.max(healthScore, 0);
  reportData.date = new Date();
  
  dailyReports.push(reportData);
  res.status(201).json(reportData);
});

app.post('/api/chatbot', authenticateToken, (req, res) => {
  const { message } = req.body;
  const response = getDoctorResponse(message);
  
  const chatEntry = {
    id: Date.now(),
    userId: req.user.userId,
    question: message,
    answer: response,
    timestamp: new Date()
  };
  
  chatHistory.push(chatEntry);
  res.json({ response });
});

function getDoctorResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('nausea') || msg.includes('morning sickness')) {
    return "Morning sickness is common. Try small frequent meals, ginger tea, and stay hydrated. Contact me if you can't keep fluids down.";
  }
  
  if (msg.includes('exercise')) {
    return "Exercise is great during pregnancy. Try walking, swimming, or prenatal yoga. Avoid contact sports and listen to your body.";
  }
  
  return "Thank you for your question. I'm here to support you throughout your pregnancy. Please contact our office for urgent concerns.";
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with in-memory database`);
});