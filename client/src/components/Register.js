import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    pregnancyWeeks: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Typography variant="h4" align="center" gutterBottom className="text-dark">
          Join Our Community
        </Typography>
        <Typography variant="body1" align="center" gutterBottom className="text-dark">
          Start your pregnancy tracking journey
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Current Week of Pregnancy"
            name="pregnancyWeeks"
            type="number"
            value={formData.pregnancyWeeks}
            onChange={handleChange}
            required
            inputProps={{ min: 1, max: 40 }}
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            className="submit-button"
            sx={{ mt: 2, mb: 2 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <Typography align="center" className="text-dark">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff6b9d', textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default Register;