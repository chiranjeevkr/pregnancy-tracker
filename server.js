const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const axios = require('axios');
const medicalKnowledgeBase = require('./medical-knowledge-base');
const { collectTrainingData, updateTrainingFeedback, getPersonalizedPatterns } = require('./ai-training-system');
require('dotenv').config();



// Initialize Gemini AI
let genAI;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Gemini API Key present:', !!apiKey);
  console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
  
  if (apiKey && apiKey !== 'your-gemini-api-key-here' && apiKey.length > 10) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.log('❌ Invalid or missing Gemini API key');
  }
} catch (error) {
  console.log('❌ Gemini AI initialization failed:', error.message);
}

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// CSRF Protection (disabled for API endpoints using JWT)
// For web forms, enable CSRF protection
const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection); // Uncomment for form-based auth

// MongoDB connection with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pregnancy-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection failed:', error.message);
    console.log('Server will continue without database...');
  }
};

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  pregnancyStartDate: { type: Date, required: true },
  currentWeek: { type: Number, default: 1 },
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String,
    countryCode: String
  }],
  doctorContact: {
    name: String,
    phone: String,
    hospital: String,
    countryCode: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Daily Report Schema
const dailyReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  bloodPressure: { systolic: Number, diastolic: Number },
  bloodSugar: Number,
  weight: Number,
  currentWeek: Number,
  mood: String,
  notes: String,
  healthScore: Number,
  riskPercentage: Number,
  aiReport: String,
  reportGenerated: { type: Boolean, default: false }
});

// Chat History Schema
const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  week: { type: Number, required: true },
  note: { type: String, default: '' },
  photo: { type: String, default: null },
  date: { type: Date, default: Date.now },
  timestamp: { type: Number, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const DailyReport = mongoose.model('DailyReport', dailyReportSchema);
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not set in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, pregnancyWeeks } = req.body;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const pregnancyStartDate = new Date();
    pregnancyStartDate.setDate(pregnancyStartDate.getDate() - (pregnancyWeeks * 7));
    
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      pregnancyStartDate,
      currentWeek: pregnancyWeeks
    });
    
    await user.save();
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, name, email, currentWeek: pregnancyWeeks } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update current week
    const now = new Date();
    const weeksPassed = Math.floor((now - user.pregnancyStartDate) / (7 * 24 * 60 * 60 * 1000));
    user.currentWeek = Math.min(weeksPassed + 1, 40);
    await user.save();
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, name: user.name, email, currentWeek: user.currentWeek } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    
    // If currentWeek is being updated, recalculate pregnancyStartDate
    if (updates.currentWeek) {
      const currentWeek = parseInt(updates.currentWeek);
      const pregnancyStartDate = new Date();
      pregnancyStartDate.setDate(pregnancyStartDate.getDate() - ((currentWeek - 1) * 7));
      updates.pregnancyStartDate = pregnancyStartDate;
    }
    
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/api/daily-report', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const reportData = { ...req.body, userId: req.user.userId };
    
    // Auto-calculate current week
    const now = new Date();
    const weeksPassed = Math.floor((now - user.pregnancyStartDate) / (7 * 24 * 60 * 60 * 1000));
    reportData.currentWeek = Math.min(weeksPassed + 1, 40);
    
    // Calculate health score based on inputs
    let healthScore = 100;
    if (reportData.bloodPressure.systolic > 140 || reportData.bloodPressure.diastolic > 90) healthScore -= 20;
    if (reportData.bloodSugar > 140) healthScore -= 15;
    if (reportData.mood === 'stressed' || reportData.mood === 'anxious') healthScore -= 10;
    
    reportData.healthScore = Math.max(healthScore, 0);
    
    const report = new DailyReport(reportData);
    await report.save();
    
    // Generate AI report
    try {
      const aiResponse = await generateHealthReport(user, reportData);
      
      // Extract risk percentage from AI response
      const riskMatch = aiResponse.match(/RISK_PERCENTAGE:\s*(\d+)/i);
      if (riskMatch) {
        report.riskPercentage = parseInt(riskMatch[1]);
        // Remove the risk percentage line from the report text
        report.aiReport = aiResponse.replace(/RISK_PERCENTAGE:\s*\d+\s*/i, '').trim();
      } else {
        // Fallback risk calculation if AI doesn't provide it
        report.riskPercentage = calculateFallbackRisk(reportData);
        report.aiReport = aiResponse;
      }
      
      report.reportGenerated = true;
      await report.save();
    } catch (aiError) {
      console.error('AI report generation failed:', aiError);
      report.aiReport = 'AI report generation failed. Please try again later.';
      report.riskPercentage = calculateFallbackRisk(reportData);
      await report.save();
    }
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate AI Health Report
async function generateHealthReport(user, reportData) {
  if (!genAI) {
    return generateFallbackReport(user, reportData);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are Dr. AI, a maternal health specialist. Analyze this pregnancy health data and provide:
1. RISK PERCENTAGE (0-100) based on the health metrics
2. Comprehensive health report

Patient: ${user.name}
Pregnancy Week: ${reportData.currentWeek}
Trimester: ${Math.ceil(reportData.currentWeek / 13.33)}

Health Data:
- Blood Pressure: ${reportData.bloodPressure.systolic}/${reportData.bloodPressure.diastolic} mmHg
- Blood Sugar: ${reportData.bloodSugar} mg/dL
- Weight: ${reportData.weight} lbs
- Mood: ${reportData.mood}
- Notes: ${reportData.notes || 'None'}
- Health Score: ${reportData.healthScore}/100

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
RISK_PERCENTAGE: [number 0-100]

[Your detailed health analysis here]

Risk Assessment Guidelines:
- 0-20%: Low risk (normal values, good mood)
- 21-40%: Mild risk (slightly elevated values)
- 41-60%: Moderate risk (concerning values, stress)
- 61-80%: High risk (multiple elevated values)
- 81-100%: Very high risk (dangerous values requiring immediate attention)

Consider: Blood pressure >140/90, blood sugar >140, stress/anxiety, pregnancy week complications.

Provide detailed analysis covering:
1. Current Health Analysis
2. Body Changes This Week
3. Specific Recommendations
4. When to Contact Doctor
5. Encouragement`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Gemini AI error:', error);
    return generateFallbackReport(user, reportData);
  }
}

// Fallback risk calculation
function calculateFallbackRisk(reportData) {
  let risk = 10; // Base low risk
  
  // Blood pressure risk
  if (reportData.bloodPressure.systolic >= 160 || reportData.bloodPressure.diastolic >= 100) {
    risk += 40; // Severe hypertension
  } else if (reportData.bloodPressure.systolic >= 140 || reportData.bloodPressure.diastolic >= 90) {
    risk += 25; // Mild hypertension
  } else if (reportData.bloodPressure.systolic >= 130 || reportData.bloodPressure.diastolic >= 85) {
    risk += 10; // Elevated
  }
  
  // Blood sugar risk
  if (reportData.bloodSugar >= 180) {
    risk += 30; // Very high
  } else if (reportData.bloodSugar >= 140) {
    risk += 20; // High
  } else if (reportData.bloodSugar >= 120) {
    risk += 10; // Elevated
  }
  
  // Mood risk
  if (reportData.mood === 'Stressed' || reportData.mood === 'Anxious') {
    risk += 15;
  } else if (reportData.mood === 'Tired') {
    risk += 5;
  }
  
  // Pregnancy week specific risks
  if (reportData.currentWeek < 12 && (reportData.bloodPressure.systolic > 140 || reportData.bloodSugar > 140)) {
    risk += 10; // Early pregnancy complications
  }
  if (reportData.currentWeek > 32 && reportData.bloodPressure.systolic > 140) {
    risk += 15; // Late pregnancy hypertension
  }
  
  return Math.min(risk, 100); // Cap at 100%
}

// Fallback report generation
function generateFallbackReport(user, reportData) {
  const trimester = Math.ceil(reportData.currentWeek / 13.33);
  
  let report = `# Health Report for ${user.name}\n`;
  report += `**Date:** ${new Date().toLocaleDateString()}\n`;
  report += `**Pregnancy Week:** ${reportData.currentWeek} (Trimester ${trimester})\n\n`;
  
  report += `## Current Health Analysis\n`;
  report += `- **Blood Pressure:** ${reportData.bloodPressure.systolic}/${reportData.bloodPressure.diastolic} mmHg `;
  if (reportData.bloodPressure.systolic > 140 || reportData.bloodPressure.diastolic > 90) {
    report += `(⚠️ Elevated - Monitor closely)\n`;
  } else {
    report += `(✅ Normal range)\n`;
  }
  
  report += `- **Blood Sugar:** ${reportData.bloodSugar} mg/dL `;
  if (reportData.bloodSugar > 140) {
    report += `(⚠️ High - Dietary adjustments needed)\n`;
  } else {
    report += `(✅ Good level)\n`;
  }
  
  report += `- **Weight:** ${reportData.weight} lbs\n`;
  report += `- **Mood:** ${reportData.mood}\n`;
  report += `- **Overall Health Score:** ${reportData.healthScore}/100\n\n`;
  
  report += `## What's Happening This Week\n`;
  if (trimester === 1) {
    report += `During week ${reportData.currentWeek}, your baby is rapidly developing. You may experience morning sickness, fatigue, and breast tenderness.\n\n`;
  } else if (trimester === 2) {
    report += `Week ${reportData.currentWeek} brings increased energy and reduced nausea. Your baby is growing quickly and you may start feeling movements.\n\n`;
  } else {
    report += `At week ${reportData.currentWeek}, your baby is preparing for birth. You may experience increased discomfort and Braxton Hicks contractions.\n\n`;
  }
  
  report += `## Recommendations\n`;
  if (reportData.bloodPressure.systolic > 140) {
    report += `- Monitor blood pressure daily and reduce salt intake\n`;
  }
  if (reportData.bloodSugar > 140) {
    report += `- Follow diabetic diet and monitor blood sugar regularly\n`;
  }
  if (reportData.mood === 'stressed' || reportData.mood === 'anxious') {
    report += `- Practice relaxation techniques and consider prenatal yoga\n`;
  }
  report += `- Continue prenatal vitamins\n`;
  report += `- Stay hydrated and eat balanced meals\n`;
  report += `- Get adequate rest and gentle exercise\n\n`;
  
  report += `## When to Contact Your Doctor\n`;
  report += `- Blood pressure consistently above 140/90\n`;
  report += `- Severe headaches or vision changes\n`;
  report += `- Unusual bleeding or discharge\n`;
  report += `- Severe abdominal pain\n\n`;
  
  report += `*This report is for informational purposes only. Always consult your healthcare provider for medical advice.*`;
  
  return report;
}

app.get('/api/daily-reports', authenticateToken, async (req, res) => {
  try {
    const reports = await DailyReport.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific report with AI analysis
app.get('/api/daily-report/:id', authenticateToken, async (req, res) => {
  try {
    const report = await DailyReport.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Personalized AI Chatbot endpoint with user data integration
app.post('/api/chatbot', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get user data for personalization
    const user = await User.findById(req.user.userId);
    
    // Always recalculate current week to ensure accuracy
    const now = new Date();
    const weeksPassed = Math.floor((now - user.pregnancyStartDate) / (7 * 24 * 60 * 60 * 1000));
    const actualCurrentWeek = Math.min(weeksPassed + 1, 40);
    
    // Update user's current week if it's different
    if (user.currentWeek !== actualCurrentWeek) {
      user.currentWeek = actualCurrentWeek;
      await user.save();
    }
    
    const recentReports = await DailyReport.find({ userId: req.user.userId })
      .sort({ date: -1 })
      .limit(7); // Last 7 days
    
    let response;
    
    // FORCE ALL QUESTIONS TO GEMINI AI FIRST
    if (genAI) {
      try {
        console.log('Sending to Gemini AI:', message);
        response = await getPersonalizedAIResponse(message, user, recentReports);
        console.log('✅ Gemini AI responded successfully');
      } catch (aiError) {
        console.log('❌ Gemini AI failed:', aiError.message);
        // Only use local fallback if Gemini completely fails
        response = `I'm having trouble connecting to my AI brain right now. Let me give you some basic advice: For nutrition questions at ${actualCurrentWeek} weeks, focus on iron, calcium, and protein. Always consult your doctor for specific food questions.`;
      }
    } else {
      // Fallback to local knowledge base
      response = getPersonalizedDoctorResponse(message, user, recentReports);
    }
    
    // Save chat history
    const chatEntry = new ChatHistory({
      userId: req.user.userId,
      question: message,
      answer: response
    });
    await chatEntry.save();
    
    // Collect training data for AI improvement
    const userContext = {
      pregnancyWeek: actualCurrentWeek,
      trimester: Math.ceil(actualCurrentWeek / 13.33),
      healthScore: recentReports.length > 0 ? recentReports[0].healthScore : null,
      mood: recentReports.length > 0 ? recentReports[0].mood : null
    };
    
    const trainingId = await collectTrainingData(req.user.userId, message, response, userContext);
    
    res.json({ response, trainingId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



// Gemini AI response function - handles ANY question
// Gemini AI response function - handles ANY question
async function getPersonalizedAIResponse(message, user, recentReports) {
  try {
    console.log('🤖 Calling Gemini AI with message:', message);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are Dr. AI, a pregnancy doctor. Give SHORT, simple answers.

Patient: ${user.name}, ${user.currentWeek} weeks pregnant
Question: "${message}"

RULES:
• Keep answer under 100 words
• Use 3-4 bullet points maximum
• Start with "Hi ${user.name}!"
• Be direct and helpful
• Add "Call doctor if serious symptoms" at end

Response:`;
    
    console.log('📝 Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini responded with:', text.substring(0, 100) + '...');
    return text;
    
  } catch (error) {
    console.log('❌ Gemini AI Error Details:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Full error:', error);
    throw error;
  }
}

// Build personalized context from user data
function buildUserContext(user, recentReports) {
  const currentWeek = user.currentWeek;
  const weeklyInfo = medicalKnowledgeBase.weeklyGuidance[currentWeek] || {};
  
  let context = `Name: ${user.name}\n`;
  context += `Current Week: ${currentWeek} (${weeklyInfo.trimester ? 'Trimester ' + weeklyInfo.trimester : 'Unknown trimester'})\n`;
  context += `Focus This Week: ${weeklyInfo.focus || 'General pregnancy care'}\n`;
  
  if (recentReports.length > 0) {
    const latestReport = recentReports[0];
    context += `Recent Health Data:\n`;
    context += `- Blood Pressure: ${latestReport.bloodPressure?.systolic}/${latestReport.bloodPressure?.diastolic}\n`;
    context += `- Weight: ${latestReport.weight} lbs\n`;
    context += `- Mood: ${latestReport.mood}\n`;
    context += `- Health Score: ${latestReport.healthScore}/100\n`;
  }
  
  return context;
}

// Get chat history
app.get('/api/chat-history', authenticateToken, async (req, res) => {
  try {
    const chatHistory = await ChatHistory.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// AI Training Feedback endpoint
app.post('/api/ai-feedback', authenticateToken, async (req, res) => {
  try {
    const { trainingId, feedback, accuracy, suggestions } = req.body;
    
    await updateTrainingFeedback(trainingId, feedback, accuracy, suggestions);
    
    res.json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for account deletion
app.post('/api/send-delete-otp', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(userId, {
      otp: otp,
      expires: Date.now() + 5 * 60 * 1000
    });
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Account Deletion OTP - Pregnancy Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f44336;">Account Deletion Request</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to delete your Pregnancy Tracker account. To confirm this action, please use the following OTP:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #f44336; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 5 minutes.</strong></p>
          <p>If you did not request this, please ignore this email and your account will remain safe.</p>
          <p>Best regards,<br>Pregnancy Tracker Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Delete account endpoint with OTP verification
app.delete('/api/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    
    // Check OTP
    const storedOtpData = otpStore.get(userId);
    if (!storedOtpData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }
    
    if (Date.now() > storedOtpData.expires) {
      otpStore.delete(userId);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    if (otp !== storedOtpData.otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid, delete account
    await User.findByIdAndDelete(userId);
    await DailyReport.deleteMany({ userId });
    await ChatHistory.deleteMany({ userId });
    
    // Clean up OTP
    otpStore.delete(userId);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Personalized doctor response function using medical knowledge base
function getPersonalizedDoctorResponse(message, user, recentReports) {
  const currentWeek = user.currentWeek;
  const weeklyInfo = medicalKnowledgeBase.weeklyGuidance[currentWeek] || {};
  const trimester = Math.ceil(currentWeek / 13.33);
  
  return getPersonalizedResponse(message, user.name, currentWeek, trimester, recentReports);
}

// Enhanced response function with personalization
function getPersonalizedResponse(message, userName, currentWeek, trimester, recentReports) {
  const msg = message.toLowerCase();
  const weeklyInfo = medicalKnowledgeBase.weeklyGuidance[currentWeek] || {};
  
  // Emergency symptoms
  if (msg.includes('severe pain') || msg.includes('heavy bleeding') || msg.includes('can\'t breathe') || msg.includes('chest pain') || msg.includes('severe headache')) {
    return `🚨 ${userName}, this sounds serious. Please go to the hospital right away or call 911. Don't wait - your safety and your baby's safety come first.`;
  }
  
  // Personalized morning sickness response
  if (msg.includes('nausea') || msg.includes('morning sickness') || msg.includes('vomit') || msg.includes('sick')) {
    const symptomInfo = medicalKnowledgeBase.symptoms['morning sickness'];
    const personalizedTip = symptomInfo.personalizedTips(currentWeek);
    
    let response = `Hi ${userName}! At ${currentWeek} weeks, ${personalizedTip.toLowerCase()}.\n\n`;
    response += `What helps:\n• Eat small meals every 2-3 hours\n• Keep crackers by your bed\n• Try ginger tea or ginger candies\n• Sip water slowly throughout the day\n• Avoid strong smells\n\n`;
    
    // Add health data context if available
    if (recentReports.length > 0 && recentReports[0].mood === 'stressed') {
      response += `I see you've been feeling stressed lately. This can make nausea worse, so try to rest when you can.\n\n`;
    }
    
    response += `Call your doctor if:\n• You can't keep water down for 24 hours\n• You're losing weight\n• You feel very weak or dizzy`;
    
    return response;
  }
  
  // Personalized exercise response
  if (msg.includes('exercise') || msg.includes('workout') || msg.includes('physical activity') || msg.includes('gym')) {
    const exerciseGuidance = medicalKnowledgeBase.exercise.byTrimester[trimester];
    
    let response = `${userName}, exercise is great during pregnancy! At ${currentWeek} weeks: ${exerciseGuidance}\n\n`;
    response += `Safe exercises for you:\n• Walking (best choice)\n• Swimming\n• Prenatal yoga\n• Stationary bike\n\n`;
    
    // Add trimester-specific advice
    if (trimester === 1) {
      response += `Since you're in your first trimester, start slowly and listen to your body.\n\n`;
    } else if (trimester === 2) {
      response += `Great news! Second trimester is the best time for exercise as your energy returns.\n\n`;
    } else {
      response += `In your third trimester, modify exercises as needed and avoid getting too hot.\n\n`;
    }
    
    response += `Avoid:\n• Contact sports\n• Activities where you might fall\n`;
    if (currentWeek > 12) response += `• Lying on your back\n`;
    response += `• Getting too hot\n\n`;
    
    response += `Stop and call your doctor if you feel:\n• Dizzy or short of breath\n• Chest pain\n• Bleeding\n• Contractions`;
    
    return response;
  }
  
  // Specific food questions
  if (msg.includes('mango') || msg.includes('eat mango')) {
    return `Yes! Mangoes are safe and healthy during pregnancy. They're rich in vitamin C, folate, and fiber - all great for you and your baby.\n\nBenefits:\n• High in vitamin C (boosts immunity)\n• Contains folate (prevents birth defects)\n• Good source of fiber (helps with constipation)\n• Natural sugars for energy\n\nJust wash them well before eating and enjoy in moderation as part of a balanced diet.`;
  }
  
  if (msg.includes('banana') || msg.includes('eat banana')) {
    return `Absolutely! Bananas are excellent during pregnancy.\n\nBenefits:\n• Rich in potassium (helps with leg cramps)\n• Contains vitamin B6 (reduces nausea)\n• Good source of fiber\n• Natural energy boost\n\nThey're especially helpful if you have morning sickness or leg cramps.`;
  }
  
  if (msg.includes('fish') || msg.includes('eat fish')) {
    return `Fish can be safe during pregnancy, but choose carefully:\n\nSafe fish (2-3 servings per week):\n• Salmon, sardines, anchovies\n• Shrimp, crab, lobster\n• Tilapia, cod, catfish\n\nAvoid:\n• Shark, swordfish, king mackerel\n• Raw fish (sushi, sashimi)\n• High-mercury fish\n\nAlways cook fish thoroughly to 145°F.`;
  }
  
  if (msg.includes('cheese') || msg.includes('eat cheese')) {
    return `Most cheese is safe during pregnancy:\n\nSafe cheeses:\n• Hard cheeses (cheddar, swiss, parmesan)\n• Pasteurized soft cheeses\n• Cream cheese, cottage cheese\n• Mozzarella, ricotta\n\nAvoid:\n• Unpasteurized soft cheeses\n• Blue cheese, brie, camembert\n• Queso fresco, feta (unless pasteurized)\n\nAlways check the label for 'pasteurized'.`;
  }
  
  if (msg.includes('coffee') || msg.includes('caffeine')) {
    return `You can have some caffeine, but limit it:\n\nSafe amount:\n• Up to 200mg per day (about 1 cup of coffee)\n• This includes tea, chocolate, and soda\n\nWhy limit caffeine:\n• Too much can increase miscarriage risk\n• Can affect baby's growth\n• May cause sleep problems\n\nTry decaf coffee or herbal teas as alternatives.`;
  }
  
  // Personalized nutrition response
  if (msg.includes('nutrition') || msg.includes('diet') || msg.includes('food') || msg.includes('eat') || msg.includes('vitamin')) {
    const nutritionInfo = medicalKnowledgeBase.nutrition[trimester];
    
    let response = `${userName}, good nutrition is so important at ${currentWeek} weeks!\n\n`;
    
    // Trimester-specific calorie needs
    if (trimester === 1) {
      response += `Good news - you don't need extra calories yet in your first trimester.\n\n`;
    } else {
      response += `You need about ${nutritionInfo.calories} extra calories per day now.\n\n`;
    }
    
    response += `Focus on these nutrients:\n`;
    nutritionInfo.focus.forEach(nutrient => {
      response += `• ${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}\n`;
    });
    
    response += `\nEat plenty of:\n`;
    nutritionInfo.foods.forEach(food => {
      response += `• ${food.charAt(0).toUpperCase() + food.slice(1)}\n`;
    });
    
    response += `\nAvoid:\n`;
    nutritionInfo.avoid.forEach(item => {
      response += `• ${item.charAt(0).toUpperCase() + item.slice(1)}\n`;
    });
    
    response += `\nTake your prenatal vitamins every day!`;
    
    // Add personalized advice based on recent health data
    if (recentReports.length > 0) {
      const latestReport = recentReports[0];
      if (latestReport.bloodPressure?.systolic > 140) {
        response += `\n\nI noticed your blood pressure was a bit high recently. Try to limit salt and eat more potassium-rich foods like bananas.`;
      }
    }
    
    return response;
  }
  
  // Weight Gain
  if (msg.includes('weight') || msg.includes('gain') || msg.includes('pounds')) {
    return "Healthy weight gain depends on your pre-pregnancy BMI. Generally: underweight women should gain 28-40 lbs, normal weight 25-35 lbs, overweight 15-25 lbs, and obese women 11-20 lbs. Weight gain should be gradual - about 1-2 lbs per week in 2nd and 3rd trimesters. Sudden weight gain or loss should be evaluated. Focus on nutritious foods rather than 'eating for two' - quality matters more than quantity.";
  }
  
  // Sleep Issues
  if (msg.includes('sleep') || msg.includes('tired') || msg.includes('insomnia')) {
    return "Sleep disturbances are common during pregnancy due to hormonal changes, physical discomfort, and anxiety. Try sleeping on your left side with a pillow between your knees. Establish a bedtime routine, avoid screens before bed, and keep your room cool and dark. Short naps (20-30 minutes) are fine. If you have severe insomnia, sleep apnea symptoms, or excessive daytime fatigue, we should discuss this further.";
  }
  
  // Back Pain
  if (msg.includes('back pain') || msg.includes('backache') || msg.includes('spine')) {
    return "Back pain affects up to 70% of pregnant women due to weight gain, posture changes, and hormone relaxin. Maintain good posture, wear supportive shoes, sleep with pillows for support, and try prenatal yoga or gentle stretching. Apply warm compresses and consider a maternity support belt. Avoid heavy lifting and prolonged standing. If pain is severe, radiates down your leg, or affects daily activities, please schedule an appointment.";
  }
  
  // Headaches
  if (msg.includes('headache') || msg.includes('migraine') || msg.includes('head pain')) {
    return "Headaches are common in early pregnancy due to hormonal changes, stress, and fatigue. Stay hydrated, eat regular meals, get adequate sleep, and manage stress. You can use acetaminophen (Tylenol) as directed, but avoid ibuprofen and aspirin. If you experience severe headaches with vision changes, swelling, or high blood pressure after 20 weeks, seek immediate medical attention as this could indicate preeclampsia.";
  }
  
  // Swelling
  if (msg.includes('swelling') || msg.includes('edema') || msg.includes('puffy')) {
    return "Mild swelling in feet, ankles, and hands is normal, especially in the third trimester. Elevate your feet when possible, wear comfortable shoes, avoid prolonged standing, and stay hydrated. However, sudden or severe swelling, especially in face and hands, accompanied by headaches or vision changes, could indicate preeclampsia and requires immediate medical evaluation.";
  }
  
  // Fetal Movement
  if (msg.includes('baby movement') || msg.includes('kicks') || msg.includes('fetal movement')) {
    return "Fetal movements are a reassuring sign of your baby's well-being. You'll typically feel first movements between 16-25 weeks. By 28 weeks, movements should be regular. I recommend doing kick counts daily - you should feel at least 10 movements in 2 hours during baby's active periods. Decreased movement, especially after 28 weeks, warrants immediate evaluation. Contact me if you notice significant changes in movement patterns.";
  }
  
  // Contractions
  if (msg.includes('contraction') || msg.includes('tightening') || msg.includes('cramping')) {
    return "Braxton Hicks contractions (practice contractions) are normal and usually irregular, painless, and stop with position changes. True labor contractions are regular, increase in intensity, and don't stop with movement. Before 37 weeks, regular contractions could indicate preterm labor. Contact me immediately if you have regular contractions before 37 weeks, or if contractions are 5 minutes apart for 1 hour after 37 weeks.";
  }
  
  // Bleeding
  if (msg.includes('bleeding') || msg.includes('spotting') || msg.includes('blood')) {
    return "Any bleeding during pregnancy should be evaluated. Light spotting in early pregnancy can be normal (implantation bleeding), but heavy bleeding, bleeding with cramping, or bleeding in later pregnancy requires immediate medical attention. Possible causes include placental issues, cervical changes, or preterm labor. Please contact me immediately if you experience any bleeding so we can assess the situation properly.";
  }
  
  // Medications
  if (msg.includes('medication') || msg.includes('medicine') || msg.includes('drug') || msg.includes('pill')) {
    return "Medication safety during pregnancy is crucial. Always consult me before taking any medications, including over-the-counter drugs and supplements. Generally safe: acetaminophen for pain/fever, certain antibiotics if needed. Avoid: ibuprofen, aspirin (except low-dose if prescribed), most herbal supplements. Continue prenatal vitamins and any medications I've specifically prescribed. Never stop prescribed medications without consulting me first.";
  }
  
  // General pregnancy concerns
  if (msg.includes('worried') || msg.includes('concern') || msg.includes('scared') || msg.includes('anxiety')) {
    return "It's completely normal to have concerns during pregnancy - this shows you care about your baby's health. Pregnancy anxiety affects many women. Practice relaxation techniques, stay informed but avoid excessive internet searching, maintain social connections, and don't hesitate to discuss any worries with me. If anxiety significantly impacts your daily life, we can explore additional support options including counseling.";
  }
  
  // Vaginal discharge
  if (msg.includes('discharge') || msg.includes('infection') || msg.includes('itch')) {
    return "Some discharge is normal during pregnancy.\n\nNormal discharge is:\n• Clear or white\n• No strong smell\n• No itching\n\nCall your doctor if you have:\n• Strong fishy smell\n• Yellow or green color\n• Itching or burning\n• Blood in discharge\n\nYeast infections are common during pregnancy and can be treated safely.";
  }
  
  // Heartburn
  if (msg.includes('heartburn') || msg.includes('acid reflux') || msg.includes('indigestion')) {
    return "Heartburn is very common during pregnancy.\n\nTo feel better:\n• Eat smaller meals more often\n• Avoid spicy and fatty foods\n• Don't lie down right after eating\n• Sleep with your head raised\n• Try Tums or Rolaids (they're safe)\n\nCall your doctor if heartburn is very bad or you can't eat.";
  }
  
  // Constipation
  if (msg.includes('constipation') || msg.includes('bowel') || msg.includes('poop')) {
    return "Constipation is common during pregnancy.\n\nTo help:\n• Eat more fruits, vegetables, and whole grains\n• Drink lots of water (8-10 glasses daily)\n• Walk every day\n• Try prunes or prune juice\n• Ask your doctor about safe stool softeners\n\nCall your doctor if you haven't had a bowel movement for 3 days.";
  }
  
  // Back pain
  if (msg.includes('back pain') || msg.includes('backache')) {
    return "Back pain is very common during pregnancy.\n\nTo feel better:\n• Use a pregnancy pillow when sleeping\n• Wear comfortable, low-heeled shoes\n• Try gentle stretching or prenatal yoga\n• Use a warm compress\n• Ask someone to massage your back\n\nCall your doctor if the pain is severe or goes down your leg.";
  }
  
  // Headaches
  if (msg.includes('headache') || msg.includes('head pain')) {
    return "Headaches are common in early pregnancy.\n\nTo help:\n• Rest in a quiet, dark room\n• Put a cold compress on your head\n• Drink plenty of water\n• Eat regular meals\n• Get enough sleep\n• You can take Tylenol if needed\n\nCall your doctor right away if you have severe headaches with blurred vision or swelling.";
  }
  
  // Weight gain
  if (msg.includes('weight') || msg.includes('gain') || msg.includes('pounds')) {
    return "Healthy weight gain depends on your starting weight.\n\nGeneral guidelines:\n• Underweight: gain 28-40 pounds\n• Normal weight: gain 25-35 pounds\n• Overweight: gain 15-25 pounds\n\nGain weight slowly and steadily. Focus on eating healthy foods, not just eating more.\n\nTalk to your doctor about what's right for you.";
  }
  
  // Baby movement
  if (msg.includes('baby movement') || msg.includes('kicks') || msg.includes('moving')) {
    return "You'll usually feel your baby move between 16-25 weeks.\n\nAfter 28 weeks, you should feel your baby move every day.\n\nCount kicks: You should feel at least 10 movements in 2 hours.\n\nCall your doctor right away if:\n• Your baby stops moving\n• Movements become much less than usual\n• You're worried about the movements";
  }
  
  // Personalized default response
  let response = `Hi ${userName}! I'm Dr. AI, and I know you're at ${currentWeek} weeks of pregnancy.\n\n`;
  
  // Add week-specific guidance
  if (weeklyInfo.focus) {
    response += `This week's focus: ${weeklyInfo.focus}\n`;
  }
  if (weeklyInfo.symptoms && weeklyInfo.symptoms.length > 0) {
    response += `Common symptoms this week: ${weeklyInfo.symptoms.join(', ')}\n`;
  }
  if (weeklyInfo.advice) {
    response += `My advice: ${weeklyInfo.advice}\n\n`;
  }
  
  response += `I can help you with:\n• Your pregnancy symptoms\n• What's normal at your stage\n• When to call your doctor\n• Healthy habits for you and baby\n\n`;
  
  // Add health data insights if available
  if (recentReports.length > 0) {
    const latestReport = recentReports[0];
    response += `Based on your recent health report:\n`;
    if (latestReport.healthScore >= 80) {
      response += `• Your health score is great (${latestReport.healthScore}/100)!\n`;
    } else if (latestReport.healthScore >= 60) {
      response += `• Your health score is good (${latestReport.healthScore}/100), but we can improve it\n`;
    } else {
      response += `• Let's work on improving your health score (${latestReport.healthScore}/100)\n`;
    }
    
    if (latestReport.mood === 'stressed' || latestReport.mood === 'anxious') {
      response += `• I see you've been feeling ${latestReport.mood}. This is normal, but let's talk about it\n`;
    }
    response += `\n`;
  }
  
  response += `Remember: This is personalized advice based on your data, but always talk to your own doctor about your specific situation.\n\n`;
  response += `Call your doctor right away if you have:\n• Severe pain\n• Heavy bleeding\n• Severe headaches\n• Trouble breathing\n`;
  if (currentWeek >= 28) {
    response += `• Your baby stops moving\n`;
  }
  response += `\nWhat would you like to know about your pregnancy?`;
  
  return response;
}

















// Emergency hospitals endpoint
app.post('/api/emergency-hospitals', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, radius = 20 } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }
    
    const searchRadius = radius * 1000;
    console.log(`🚨 Emergency: Finding hospitals within ${radius}km of: ${lat}, ${lng}`);
    
    let allHospitals = [];
    
    try {
      const osmResults = await searchOpenStreetMap(lat, lng, searchRadius);
      allHospitals.push(...osmResults);
      console.log(`✅ Found ${osmResults.length} facilities`);
    } catch (error) {
      console.log('❌ Hospital search failed:', error.message);
    }
    
    const filteredHospitals = allHospitals.filter(h => h.distance <= radius);
    
    const maternalHospitals = filteredHospitals
      .filter(h => h.type === 'maternal')
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
    
    const ivfCenters = filteredHospitals
      .filter(h => h.type === 'ivf')
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    
    console.log(`🎯 Emergency: Found ${maternalHospitals.length} maternal, ${ivfCenters.length} IVF`);
    
    res.json({ 
      maternalHospitals,
      ivfCenters,
      searchRadius: radius
    });
    
  } catch (error) {
    console.error('💥 Emergency hospital search error:', error);
    res.status(500).json({ message: 'Failed to find hospitals' });
  }
});

async function searchOpenStreetMap(lat, lng, radius) {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
      node["healthcare"~"fertility|reproductive"](around:${radius},${lat},${lng});
      way["healthcare"~"fertility|reproductive"](around:${radius},${lat},${lng});
    );
    out center meta;
  `;
  
  const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
    headers: { 'Content-Type': 'text/plain' },
    timeout: 35000
  });
  
  const elements = response.data.elements || [];
  
  return elements.map(element => {
    const lat_coord = element.lat || element.center?.lat;
    const lng_coord = element.lon || element.center?.lon;
    
    if (!lat_coord || !lng_coord) return null;
    
    const name = (element.tags?.name || 'Medical Facility').toLowerCase();
    const healthcare = (element.tags?.healthcare || '').toLowerCase();
    const specialty = (element.tags?.specialty || '').toLowerCase();
    
    const isIVF = name.includes('fertility') || name.includes('ivf') || name.includes('reproductive') ||
                  healthcare.includes('fertility') || healthcare.includes('reproductive') ||
                  specialty.includes('fertility') || specialty.includes('reproductive');
    
    return {
      id: element.id.toString(),
      name: element.tags?.name || 'Medical Facility',
      address: buildAddress(element.tags),
      lat: lat_coord,
      lng: lng_coord,
      distance: calculateDistance(lat, lng, lat_coord, lng_coord),
      phone: element.tags?.phone || null,
      type: isIVF ? 'ivf' : 'maternal'
    };
  }).filter(Boolean);
}

function buildAddress(tags) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:country']) parts.push(tags['addr:country']);
  
  return parts.length > 0 ? parts.join(', ') : 'Address not available';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return 999;
  }
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
}

// Journal API endpoints
app.post('/api/journal', authenticateToken, async (req, res) => {
  try {
    const { note, photo, week } = req.body;
    
    if (!note.trim() && !photo) {
      return res.status(400).json({ message: 'Please add a note or photo' });
    }
    
    const journalEntry = new JournalEntry({
      userId: req.user.userId,
      note: note || '',
      photo: photo || null,
      week: week || 1,
      timestamp: Date.now()
    });
    
    await journalEntry.save();
    res.status(201).json(journalEntry);
  } catch (error) {
    console.error('Journal save error:', error);
    res.status(500).json({ message: 'Failed to save journal entry' });
  }
});

app.get('/api/journal', authenticateToken, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.userId })
      .sort({ week: -1, timestamp: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Journal fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch journal entries' });
  }
});

app.delete('/api/journal/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Journal delete error:', error);
    res.status(500).json({ message: 'Failed to delete journal entry' });
  }
});

// Test Gemini API endpoint
app.get('/api/test-gemini', async (req, res) => {
  if (!genAI) {
    return res.json({ error: 'Gemini AI not initialized' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in 5 words");
    const response = await result.response;
    const text = response.text();
    
    res.json({ success: true, response: text });
  } catch (error) {
    res.json({ error: error.message, details: error });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});