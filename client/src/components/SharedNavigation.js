import React, { useState, useEffect } from 'react';
import { 
  IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Menu as MenuIcon, Home, Person, ExitToApp,
  Assignment, Chat, FitnessCenter, Games, Emergency, LocalHospital
} from '@mui/icons-material';
import SharedHeader from './SharedHeader';



const SharedNavigation = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
    { label: 'Daily Report', path: '/daily-report', icon: <Assignment /> },
    { label: 'AI Chatbot', path: '/chatbot', icon: <Chat /> },
    { label: 'Exercise Guide', path: '/exercise', icon: <FitnessCenter /> },
    { label: 'Stress Relief', path: '/game', icon: <Games /> },
    { label: 'Find Hospitals', path: '/hospitals', icon: <LocalHospital /> },
    { label: 'Emergency SOS', path: '/sos', icon: <Emergency /> },
  ];

  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('healthNotifications') || '[]');
      setNotifications(storedNotifications);
    };
    
    loadNotifications();
    const notificationInterval = setInterval(loadNotifications, 5000);
    
    return () => clearInterval(notificationInterval);
  }, []);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <SharedHeader user={user} onLogout={onLogout} notifications={notifications} />
        <IconButton
          sx={{ 
            position: 'absolute',
            top: 8,
            left: 16,
            color: '#667eea',
            zIndex: 1200
          }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="h5" sx={{ 
              color: '#667eea', 
              fontWeight: 700,
              fontSize: '1.4rem'
            }}>
              Mom's Saathi
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Week {user?.currentWeek || 1}
            </Typography>
          </Box>
          <Divider />
          <List>
            {navigationItems.map((item) => (
              <ListItem 
                button 
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#667eea' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem 
              button 
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/login');
                }
                setDrawerOpen(false);
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 68, 68, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#ff4444' }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: '#ff4444' }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default SharedNavigation;