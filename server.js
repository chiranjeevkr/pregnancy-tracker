const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pregnancy-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
    relation: String
  }],
  doctorContact: {
    name: String,
    phone: String,
    hospital: String
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
  situation: String,
  healthScore: Number
});

// Chat History Schema
const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const DailyReport = mongoose.model('DailyReport', dailyReportSchema);
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

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
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ token, user: { id: user._id, name, email, currentWeek: pregnancyWeeks } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
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
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name: user.name, email, currentWeek: user.currentWeek } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/daily-report', authenticateToken, async (req, res) => {
  try {
    const reportData = { ...req.body, userId: req.user.userId };
    
    // Calculate health score based on inputs
    let healthScore = 100;
    if (reportData.bloodPressure.systolic > 140 || reportData.bloodPressure.diastolic > 90) healthScore -= 20;
    if (reportData.bloodSugar > 140) healthScore -= 15;
    if (reportData.mood === 'stressed' || reportData.mood === 'anxious') healthScore -= 10;
    
    reportData.healthScore = Math.max(healthScore, 0);
    
    const report = new DailyReport(reportData);
    await report.save();
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/daily-reports', authenticateToken, async (req, res) => {
  try {
    const reports = await DailyReport.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced Chatbot endpoint with OpenAI integration
app.post('/api/chatbot', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    let response;
    
    // Try Gemini AI first, fallback to local responses
    if (process.env.GEMINI_API_KEY) {
      try {
        response = await getGeminiResponse(message);
      } catch (aiError) {
        console.log('Gemini AI error, using fallback:', aiError.message);
        response = getDoctorResponse(message);
      }
    } else {
      response = getDoctorResponse(message);
    }
    
    // Save chat history
    const chatEntry = new ChatHistory({
      userId: req.user.userId,
      question: message,
      answer: response
    });
    await chatEntry.save();
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Gemini AI response function
async function getGeminiResponse(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `You are Dr. AI, a specialized maternal health consultant and pregnancy expert. You provide professional, compassionate, and evidence-based medical guidance for pregnant women.

Guidelines:
- Always respond as a healthcare professional
- Provide specific, actionable medical advice
- Include safety warnings when appropriate
- Mention when to seek immediate medical attention
- Use professional medical terminology but explain it clearly
- Be empathetic and supportive
- Always include disclaimers for serious symptoms
- Focus specifically on pregnancy, maternal health, and prenatal care

Important: Always remind patients that this is general guidance and they should consult their healthcare provider for personalized medical advice, especially for urgent concerns.

Patient Question: ${message}

Dr. AI Response:`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
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

// Doctor-like response function
function getDoctorResponse(message) {
  const msg = message.toLowerCase();
  
  // Nausea and Morning Sickness
  if (msg.includes('nausea') || msg.includes('morning sickness') || msg.includes('vomit')) {
    return "As your healthcare provider, I understand morning sickness can be challenging. This is very common, affecting 70-80% of pregnant women. Try eating small, frequent meals every 2-3 hours, avoid empty stomach, and consider ginger tea or crackers. Stay hydrated with small sips of water. If you're unable to keep fluids down for 24 hours or lose weight, please contact me immediately as this could indicate hyperemesis gravidarum.";
  }
  
  // Exercise and Physical Activity
  if (msg.includes('exercise') || msg.includes('workout') || msg.includes('physical activity')) {
    return "Exercise during pregnancy is excellent for both you and your baby. I recommend 150 minutes of moderate-intensity exercise weekly. Safe activities include walking, swimming, prenatal yoga, and stationary cycling. Avoid contact sports, activities with fall risk, and lying flat on your back after first trimester. Listen to your body - if you feel dizzy, short of breath, or experience chest pain, stop immediately and rest.";
  }
  
  // Nutrition and Diet
  if (msg.includes('nutrition') || msg.includes('diet') || msg.includes('food') || msg.includes('eat')) {
    return "Proper nutrition is crucial for your baby's development. Focus on a balanced diet with folate-rich foods (leafy greens, citrus), calcium sources (dairy, fortified foods), iron-rich foods (lean meat, beans), and omega-3 fatty acids (fish, walnuts). Take your prenatal vitamins daily. Avoid raw fish, undercooked meat, unpasteurized products, and limit caffeine to 200mg daily. Aim for 300-500 extra calories in 2nd and 3rd trimesters.";
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
  
  // Default response
  return "Thank you for your question. As your healthcare provider, I'm here to support you throughout your pregnancy journey. Every pregnancy is unique, and it's important to discuss your specific situation with me during our appointments. If you have urgent concerns, please don't hesitate to contact our office immediately. For routine questions, I'm happy to address them during your regular visits. Remember, no question is too small when it comes to your and your baby's health.";
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});