import React from 'react';
import { Typography, Button, Box } from '@mui/material';

const DailyRoutinePopup = ({ user, onClose }) => {
  const dailyRoutines = [
    { text: 'Drink enough water today (8-10 glasses)', icon: '💧' },
    { text: 'Take your prenatal vitamins', icon: '💊' },
    { text: 'Do light exercise or walking', icon: '🚶♀️' },
    { text: 'Get enough rest and sleep', icon: '😴' },
    { text: 'Eat nutritious meals', icon: '🥗' }
  ];

  return (
    <div className="popup-overlay">
      <div className="popup-content" style={{ maxWidth: '500px' }}>
        <Typography variant="h5" gutterBottom className="text-dark" sx={{ textAlign: 'center', mb: 2 }}>
          Daily Health Reminders 🌸
        </Typography>
        
        <Typography variant="body1" gutterBottom className="text-dark" sx={{ textAlign: 'center', mb: 3 }}>
          Remember to take care of yourself today!
        </Typography>

        <Box sx={{ mb: 3 }}>
          {dailyRoutines.map((routine, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1 }}>
              <span style={{ fontSize: '24px' }}>{routine.icon}</span>
              <Typography variant="body1" className="text-dark">
                {routine.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', textAlign: 'center' }} className="text-dark">
          Remember: Your health is your baby's health! 💕
        </Typography>

        <Button 
          variant="contained" 
          onClick={onClose}
          className="submit-button"
          fullWidth
        >
          Got it, thanks!
        </Button>
      </div>
    </div>
  );
};

export default DailyRoutinePopup;