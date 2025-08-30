import React from 'react';
import { Typography, Button } from '@mui/material';

const WelcomePopup = ({ user, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <Typography variant="h5" gutterBottom className="text-dark">
          Welcome back, {user.name}! 🌸
        </Typography>
        <Typography variant="body1" gutterBottom className="text-dark">
          You are currently in week {user.currentWeek} of your pregnancy journey.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }} className="text-dark">
          We're here to support you every step of the way!
        </Typography>
        <Button 
          variant="contained" 
          onClick={onClose}
          className="submit-button"
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default WelcomePopup;