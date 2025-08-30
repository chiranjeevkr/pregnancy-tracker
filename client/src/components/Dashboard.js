import React, { useEffect, useState } from 'react';
import { 
  Typography, Card, CardContent, Grid, Box, 
  AppBar, Toolbar, Avatar, Badge, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Assignment, Chat, FitnessCenter, Games, 
  LocalHospital, Emergency, Notifications,
  Menu as MenuIcon, Woman, Person, Logout
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/system';

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

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [weekInfo, setWeekInfo] = useState('');
  const [notificationsCount] = useState(2);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

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
    const week = user.currentWeek;
    if (week <= 12) {
      setWeekInfo('First trimester - Focus on nutrition and rest');
    } else if (week <= 28) {
      setWeekInfo('Second trimester - Great time for gentle exercise');
    } else {
      setWeekInfo('Third trimester - Prepare for delivery');
    }
  }, [user.currentWeek]);

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
  const progress = Math.min(100, (user.currentWeek / 40) * 100);

  return (
    <>
      <StyledAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
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
          <IconButton color="inherit" sx={{ color: '#667eea' }}>
            <Badge badgeContent={notificationsCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={handleAvatarClick}>
            <Avatar 
              sx={{ ml: 2, bgcolor: '#667eea', width: 40, height: 40 }}
              src={user.avatar}
            >
              {user.name.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>

      <DashboardContainer>
        <HeaderSection>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" gutterBottom fontWeight="700">
              Week {user.currentWeek} of Pregnancy
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
          Welcome back, {user.name}! 🌸
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
            {user.currentWeek <= 12 
              ? "Focus on getting enough folic acid, iron, and calcium. Small, frequent meals can help with morning sickness. Stay hydrated and consider light walks."
              : user.currentWeek <= 28 
              ? "Stay hydrated and consider prenatal yoga. This is a good time to plan your maternity leave. Monitor your baby's movements daily."
              : "Practice breathing exercises. Pack your hospital bag and finalize your birth plan. Watch for signs of labor and rest when possible."}
          </Typography>
        </Box>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;