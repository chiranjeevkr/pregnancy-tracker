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
import SOS from './components/SOS';
import HospitalMap from './components/HospitalMap';
import Navbar from './components/Navbar';
import WelcomePopup from './components/WelcomePopup';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b9d',
    },
    secondary: {
      main: '#ffc1cc',
    },
    background: {
      default: '#fff0f5',
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setShowWelcome(true);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setShowWelcome(true);
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
          {user && <Navbar user={user} onLogout={handleLogout} />}
          
          {showWelcome && user && (
            <WelcomePopup 
              user={user} 
              onClose={() => setShowWelcome(false)} 
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
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/daily-report" 
              element={user ? <DailyReport user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chatbot" 
              element={user ? <Chatbot /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/exercise" 
              element={user ? <Exercise user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/game" 
              element={user ? <Game /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/sos" 
              element={user ? <SOS user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/hospitals" 
              element={user ? <HospitalMap /> : <Navigate to="/login" />} 
            />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;