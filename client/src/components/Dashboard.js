import React, { useEffect, useState } from 'react';
import { 
  Typography, Card, CardContent, Grid, Box, 
  AppBar, Toolbar, Avatar, Badge, IconButton,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Assignment, Chat, FitnessCenter, Games, 
  LocalHospital, Emergency, Notifications,
  Menu as MenuIcon, Woman, Home, Person, ExitToApp
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/system';
import axios from 'axios';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const DashboardContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e9f0 100%)',
  minHeight: '100vh',
  fontFamily: '"Poppins", "Roboto", sans-serif',
}));

const HeaderSection = styled('div')(({ theme }) => ({
  background: 'linear-gradient(120deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' width=\'100\' height=\'100\' opacity=\'0.1\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'5\' fill=\'white\' /%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'10\' fill=\'white\' /%3E%3Ccircle cx=\'80\' cy=\'80\' r=\'7\' fill=\'white\' /%3E%3C/svg%3E")',
    opacity: 0.3,
  }
}));

const DashboardCard = styled(Card)(({ theme, gradient }) => ({
  borderRadius: '18px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  height: '100%',
  background: gradient || 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
    animation: `${pulse} 1s ease-in-out`,
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  color: theme.palette.text.primary,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
}));

const ProgressBar = styled('div')(({ theme, progress }) => ({
  height: '6px',
  borderRadius: '3px',
  background: 'rgba(255, 255, 255, 0.3)',
  marginTop: theme.spacing(2),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    background: 'linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)',
    borderRadius: '3px',
    transition: 'width 0.5s ease'
  }
}));

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [weekInfo, setWeekInfo] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

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

  // Fetch fresh user data and notifications on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update current user state and localStorage
        setCurrentUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If fetch fails, use the user prop
        setCurrentUser(user);
      }
    };
    
    // Load notifications from localStorage
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('healthNotifications') || '[]');
      setNotifications(storedNotifications);
    };
    
    fetchUserData();
    loadNotifications();
    
    // Set up interval to check for new notifications
    const notificationInterval = setInterval(loadNotifications, 5000);
    
    return () => clearInterval(notificationInterval);
  }, [user]);

  useEffect(() => {
    // Set up daily notification reminder
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      const timeUntilNotification = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        new Notification('Pregnancy Tracker Reminder', {
          body: 'Time for your daily routine check-up!',
          icon: '/favicon.ico'
        });
      }, timeUntilNotification);
    } else if ('Notification' in window) {
      Notification.requestPermission();
    }

    // Set week-specific information
    const week = currentUser.currentWeek;
    if (week <= 12) {
      setWeekInfo('First trimester - Focus on nutrition and rest');
    } else if (week <= 28) {
      setWeekInfo('Second trimester - Great time for gentle exercise');
    } else {
      setWeekInfo('Third trimester - Prepare for delivery');
    }
  }, [currentUser.currentWeek]);

  const dashboardItems = [
    {
      title: 'Daily Report',
      description: 'Track your daily health metrics',
      icon: <Assignment sx={{ fontSize: 32, color: 'white' }} />,
      path: '/daily-report',
      gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      color: 'white'
    },
    {
      title: 'AI Chatbot',
      description: 'Get answers to your pregnancy questions',
      icon: <Chat sx={{ fontSize: 32, color: 'white' }} />,
      path: '/chatbot',
      gradient: 'linear-gradient(135deg, #ff6b9d 0%, #ffa69e 100%)',
      color: 'white'
    },
    {
      title: 'Exercise Guide',
      description: 'Safe exercises for your pregnancy week',
      icon: <FitnessCenter sx={{ fontSize: 32, color: 'white' }} />,
      path: '/exercise',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      color: 'white'
    },
    {
      title: 'Stress Relief',
      description: 'Play games to relax and unwind',
      icon: <Games sx={{ fontSize: 32, color: 'white' }} />,
      path: '/game',
      gradient: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
      color: 'white'
    },
    {
      title: 'Find Hospitals',
      description: 'Locate nearby hospitals and clinics',
      icon: <LocalHospital sx={{ fontSize: 32, color: 'white' }} />,
      path: '/hospitals',
      gradient: 'linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)',
      color: 'white'
    },
    {
      title: 'Emergency SOS',
      description: 'Quick access to emergency contacts',
      icon: <Emergency sx={{ fontSize: 32, color: 'white' }} />,
      path: '/sos',
      gradient: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
      color: 'white'
    }
  ];

  // Calculate pregnancy progress
  const progress = Math.min(100, (currentUser.currentWeek / 40) * 100);

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
            onClick={() => setNotificationDialogOpen(true)}
          >
            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Avatar 
            sx={{ ml: 2, bgcolor: '#667eea', width: 40, height: 40 }}
            src={currentUser.avatar}
          >
            {currentUser.name.charAt(0)}
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
              Week {currentUser.currentWeek}
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

      <DashboardContainer>
        <HeaderSection>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" gutterBottom fontWeight="700">
              Week {currentUser.currentWeek} of Pregnancy
            </Typography>
            <Typography variant="h6" fontWeight="400" sx={{ opacity: 0.9 }}>
              {weekInfo}
            </Typography>
            
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </Typography>
              <ProgressBar progress={progress} />
            </Box>
          </Box>
        </HeaderSection>

        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: '600', 
          textAlign: 'center', 
          mb: 4,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome back, {currentUser.name}! 🌸
        </Typography>

        <Grid container spacing={3}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <DashboardCard 
                gradient={item.gradient}
                onClick={() => navigate(item.path)}
              >
                <CardContent sx={{ textAlign: 'center', color: item.color, p: 3 }}>
                  <Box sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    mb: 2, 
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {item.description}
                  </Typography>
                </CardContent>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>

        {/* New Feature: Weekly Tips */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          borderRadius: '18px', 
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
        }}>
          <Typography variant="h6" gutterBottom fontWeight="600" color="#667eea">
            This Week's Tips
          </Typography>
          <Typography variant="body2" color="#5a67d8" sx={{ lineHeight: 1.6 }}>
            {currentUser.currentWeek <= 12 
              ? "Focus on getting enough folic acid, iron, and calcium. Small, frequent meals can help with morning sickness. Stay hydrated and consider light walks."
              : currentUser.currentWeek <= 28 
              ? "Stay hydrated and consider prenatal yoga. This is a good time to plan your maternity leave. Monitor your baby's movements daily."
              : "Practice breathing exercises. Pack your hospital bag and finalize your birth plan. Watch for signs of labor and rest when possible."}
          </Typography>
        </Box>
        
        {/* Notifications Dialog */}
        <Dialog 
          open={notificationDialogOpen} 
          onClose={() => setNotificationDialogOpen(false)}
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '24px 24px 0 0',
            py: 3,
            textAlign: 'center'
          }}>
            🔔 Health Notifications
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {notifications.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                No notifications yet
              </Typography>
            ) : (
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.map((notification) => (
                  <Box 
                    key={notification.id}
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: '12px',
                      background: notification.type === 'HIGH_RISK' 
                        ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: '600' }}>
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Chip 
                          label="New" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.3)', 
                            color: 'white',
                            fontWeight: '600'
                          }} 
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => {
                // Mark all as read
                const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
                localStorage.setItem('healthNotifications', JSON.stringify(updatedNotifications));
                setNotifications(updatedNotifications);
              }}
              sx={{ borderRadius: '12px', textTransform: 'none' }}
            >
              Mark All Read
            </Button>
            <Button 
              onClick={() => setNotificationDialogOpen(false)}
              variant="contained"
              sx={{ 
                borderRadius: '12px', 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;