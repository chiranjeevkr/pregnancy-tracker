import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, Person, Assignment, Chat, FitnessCenter, Games, Emergency } from '@mui/icons-material';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
    { label: 'Daily Report', path: '/daily-report', icon: <Assignment /> },
    { label: 'Chat', path: '/chatbot', icon: <Chat /> },
    { label: 'Exercise', path: '/exercise', icon: <FitnessCenter /> },
    { label: 'Game', path: '/game', icon: <Games /> },

    { label: 'SOS', path: '/sos', icon: <Emergency /> },
  ];

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #e91e63, #f44336)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
          Pregnancy Tracker
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {item.label}
            </Button>
          ))}
          
          <Button 
            color="inherit" 
            onClick={onLogout}
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;