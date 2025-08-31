import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Card, CardContent, Alert } from '@mui/material';
import axios from 'axios';
import SharedNavigation from './SharedNavigation';

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentWeek: '',
    emergencyContacts: [{ name: '', phone: '', relation: '' }],
    doctorContact: { name: '', phone: '', hospital: '' }
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        currentWeek: response.data.currentWeek || '',
        emergencyContacts: response.data.emergencyContacts?.length > 0 
          ? response.data.emergencyContacts 
          : [{ name: '', phone: '', relation: '' }],
        doctorContact: response.data.doctorContact || { name: '', phone: '', hospital: '' }
      });
    } catch (error) {
      setMessage('Error fetching profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency-')) {
      const [, index, field] = name.split('-');
      const newContacts = [...formData.emergencyContacts];
      newContacts[index][field] = value;
      setFormData({ ...formData, emergencyContacts: newContacts });
    } else if (name.startsWith('doctor-')) {
      const field = name.split('-')[1];
      setFormData({
        ...formData,
        doctorContact: { ...formData.doctorContact, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addEmergencyContact = () => {
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', relation: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update user state and localStorage
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Profile updated successfully!');
      
      // Refresh profile data to get updated values
      setTimeout(() => {
        fetchProfile();
      }, 1000);
    } catch (error) {
      setMessage('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SharedNavigation user={user} />
      <div className="dashboard-container">
      <Typography variant="h4" gutterBottom className="text-dark">
        My Profile
      </Typography>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Personal Information
          </Typography>
          
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
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
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Current Week of Pregnancy"
            name="currentWeek"
            type="number"
            value={formData.currentWeek}
            onChange={handleChange}
            inputProps={{ min: 1, max: 40 }}
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Doctor Contact
          </Typography>
          
          <TextField
            fullWidth
            label="Doctor Name"
            name="doctor-name"
            value={formData.doctorContact.name}
            onChange={handleChange}
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Doctor Phone"
            name="doctor-phone"
            value={formData.doctorContact.phone}
            onChange={handleChange}
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
          
          <TextField
            fullWidth
            label="Hospital Name"
            name="doctor-hospital"
            value={formData.doctorContact.hospital}
            onChange={handleChange}
            className="form-input"
            InputLabelProps={{ style: { color: '#2c2c2c' } }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Emergency Contacts
          </Typography>
          
          {formData.emergencyContacts.map((contact, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <TextField
                fullWidth
                label="Contact Name"
                name={`emergency-${index}-name`}
                value={contact.name}
                onChange={handleChange}
                className="form-input"
                InputLabelProps={{ style: { color: '#2c2c2c' } }}
              />
              
              <TextField
                fullWidth
                label="Phone Number"
                name={`emergency-${index}-phone`}
                value={contact.phone}
                onChange={handleChange}
                className="form-input"
                InputLabelProps={{ style: { color: '#2c2c2c' } }}
              />
              
              <TextField
                fullWidth
                label="Relation"
                name={`emergency-${index}-relation`}
                value={contact.relation}
                onChange={handleChange}
                className="form-input"
                InputLabelProps={{ style: { color: '#2c2c2c' } }}
              />
            </Box>
          ))}
          
          <Button 
            variant="outlined" 
            onClick={addEmergencyContact}
            sx={{ mb: 2 }}
          >
            Add Emergency Contact
          </Button>
        </CardContent>
      </Card>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        onClick={handleSubmit}
        className="submit-button"
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </Button>
    </div>
    </>
  );
};

export default Profile;