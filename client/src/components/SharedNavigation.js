import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Avatar, Badge, IconButton, Box, Typography,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Menu as MenuIcon, Notifications, Woman, Home, Person, ExitToApp,
  Assignment, Chat, FitnessCenter, Games, LocalHospital, Emergency
} from '@mui/icons-material';
import { styled } from '@mui/system';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  color: theme.palette.text.primary,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
}));

const SharedNavigation = ({ user }) => {
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
      <StyledAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2, color: '#667eea' }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Woman sx={{ color: '#667eea', mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: '600' }}>
              PregnancyCare
            </Typography>
          </Box>
          <IconButton 
            color="inherit" 
            sx={{ color: '#667eea' }}
            onClick={() => navigate('/dashboard')}
          >
            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Avatar 
            sx={{ ml: 2, bgcolor: '#667eea', width: 40, height: 40 }}
            src={user?.avatar}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </Toolbar>
      </StyledAppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 600 }}>
              PregnancyCare
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
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
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