# Pregnancy Tracker - MERN Stack Application

A comprehensive pregnancy tracking application built with MongoDB, Express.js, React, and Node.js. This application helps pregnant women track their journey through all 9 months with AI-powered chatbot support, exercise guides, stress-relief games, and emergency features.

## Features

### 🔐 Authentication & User Management
- User registration with pregnancy details
- Secure login with JWT authentication
- Personalized dashboard for each user
- Automatic pregnancy week calculation and updates
- Welcome popup with current pregnancy week

### 📊 Health Tracking
- Daily health reports (BP, blood sugar, weight, mood)
- Downloadable PDF health reports
- Health score calculation
- Historical data tracking

### 🤖 AI Chatbot
- Pregnancy-specific question answering
- Quick question templates
- 24/7 support for pregnancy concerns

### 💪 Exercise Guide
- Trimester-specific exercise recommendations
- Safety precautions and benefits
- Week-appropriate workout plans

### 🎮 Stress Relief Game
- Memory matching game for relaxation
- Rotating relaxation tips
- Pregnancy-specific stress management

### 🚨 Emergency Features
- SOS button with emergency contacts
- Doctor contact management
- Emergency services quick dial
- Pregnancy emergency symptom guide

### 🏥 Hospital Finder
- Nearby hospital search
- Interactive map integration
- Direct links to hospital websites
- Contact information and directions

### 📱 Additional Features
- Daily notification reminders
- Profile management
- Dark text for better visibility
- Responsive design
- Beautiful UI with pregnancy-themed colors

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/pregnancy-tracker
JWT_SECRET=your-secret-key-here
PORT=5000
```

3. Start MongoDB service on your system

4. Start the backend server:
```bash
npm run server
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

### Full Application

To run both backend and frontend simultaneously:
```bash
npm run dev
```

## Usage

1. **Registration**: Create an account with your name, email, phone, current pregnancy week, and password
2. **Login**: Sign in to access your personalized dashboard
3. **Dashboard**: Navigate through different features using the menu
4. **Daily Reports**: Track your daily health metrics
5. **Chatbot**: Ask pregnancy-related questions
6. **Exercise**: Follow week-appropriate exercise guides
7. **Games**: Play stress-relief games
8. **SOS**: Access emergency contacts and services
9. **Hospitals**: Find nearby hospitals and clinics

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Health Tracking
- `POST /api/daily-report` - Submit daily health report
- `GET /api/daily-reports` - Get user's health reports

### Chatbot
- `POST /api/chatbot` - Send message to chatbot

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls
- jsPDF for report generation

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Input validation
- CORS configuration

## Future Enhancements
- Real AI model integration for chatbot
- Push notifications
- Real-time chat with healthcare providers
- Integration with wearable devices
- Appointment scheduling
- Nutrition tracking
- Baby development timeline

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Support
For support and questions, please contact the development team or create an issue in the repository.