import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Assignment, Chat, FitnessCenter, Games, LocalHospital, Emergency } from '@mui/icons-material';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [weekInfo, setWeekInfo] = useState('');

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
      icon: <Assignment sx={{ fontSize: 40, color: '#ff6b9d' }} />,
      path: '/daily-report'
    },
    {
      title: 'AI Chatbot',
      description: 'Get answers to your pregnancy questions',
      icon: <Chat sx={{ fontSize: 40, color: '#ff6b9d' }} />,
      path: '/chatbot'
    },
    {
      title: 'Exercise Guide',
      description: 'Safe exercises for your pregnancy week',
      icon: <FitnessCenter sx={{ fontSize: 40, color: '#ff6b9d' }} />,
      path: '/exercise'
    },
    {
      title: 'Stress Relief Game',
      description: 'Play games to relax and unwind',
      icon: <Games sx={{ fontSize: 40, color: '#ff6b9d' }} />,
      path: '/game'
    },
    {
      title: 'Find Hospitals',
      description: 'Locate nearby hospitals and clinics',
      icon: <LocalHospital sx={{ fontSize: 40, color: '#ff6b9d' }} />,
      path: '/hospitals'
    },
    {
      title: 'Emergency SOS',
      description: 'Quick access to emergency contacts',
      icon: <Emergency sx={{ fontSize: 40, color: '#ff4444' }} />,
      path: '/sos'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="week-display">
        <Typography variant="h4" gutterBottom>
          Week {user.currentWeek} of Pregnancy
        </Typography>
        <Typography variant="h6">
          {weekInfo}
        </Typography>
      </div>

      <Typography variant="h5" gutterBottom className="text-dark">
        Welcome back, {user.name}! 🌸
      </Typography>

      <Grid container spacing={3} sx={{ mt:2}}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              className="dashboard-card"
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" gutterBottom className="text-dark">
                  {item.title}
                </Typography>
                <Typography variant="body2" className="text-dark">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;