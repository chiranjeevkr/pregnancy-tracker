import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import DailyReport from './components/DailyReport';
import Chatbot from './components/Chatbot';
import Exercise from './components/Exercise';
import Game from './components/Game';
import Journal from './components/Journal';
import SOS from './components/SOS';
import Emergency from './components/Emergency';

import WelcomePopup from './components/WelcomePopup';
import DailyRoutinePopup from './components/DailyRoutinePopup';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
    },
    secondary: {
      main: '#f44336',
    },
    background: {
      default: '#ffebee',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      color: '#2c2c2c',
      fontWeight: 600,
    },
    body1: {
      color: '#333333',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDailyRoutine, setShowDailyRoutine] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const lastRoutineCheck = localStorage.getItem('lastRoutineCheck');
    const today = new Date().toDateString();
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      // Show welcome popup for returning users, but only show routine popup if not shown today
      if (lastRoutineCheck !== today) {
        setShowWelcome(true);
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setShowWelcome(true);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    setShowDailyRoutine(true);
  };

  const handleDailyRoutineClose = () => {
    setShowDailyRoutine(false);
    // Mark that routine popup was shown today
    localStorage.setItem('lastRoutineCheck', new Date().toDateString());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">

          
          {showWelcome && user && (
            <WelcomePopup 
              user={user} 
              onClose={handleWelcomeClose} 
            />
          )}
          
          {showDailyRoutine && user && (
            <DailyRoutinePopup 
              user={user} 
              onClose={handleDailyRoutineClose} 
            />
          )}
          
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} setUser={setUser} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/daily-report" 
              element={user ? <DailyReport user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chatbot" 
              element={user ? <Chatbot user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/exercise" 
              element={user ? <Exercise user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/game" 
              element={user ? <Game user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/journal" 
              element={user ? <Journal user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/sos" 
              element={user ? <SOS user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/emergency" 
              element={user ? <Emergency user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />

            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;