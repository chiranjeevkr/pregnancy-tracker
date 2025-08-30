import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Card, CardContent, Alert, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Divider } from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import axios from 'axios';

const Profile = ({ user, setUser, onLogout }) => {
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [randomNumber, setRandomNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

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
      
      setUser({ ...user, ...response.data });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const random = Math.floor(Math.random() * 9000) + 1000;
    setRandomNumber(random.toString());
    setDeleteDialogOpen(true);
    setUserInput('');
    setOtpInput('');
    setOtpSent(false);
    setMessage('');
  };

  const sendOtp = async () => {
    setSendingOtp(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/send-delete-otp', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOtpSent(true);
      setMessage('OTP sent to your registered email address!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const confirmDelete = async () => {
    if (userInput !== randomNumber) {
      setMessage('Random number does not match!');
      return;
    }
    
    if (!otpInput) {
      setMessage('Please enter the OTP!');
      return;
    }

    setIsDeleting(true);
    
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:5000/api/delete-account', {
          headers: { Authorization: `Bearer ${token}` },
          data: { otp: otpInput }
        });
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setDeleteDialogOpen(false);
        onLogout();
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error deleting account');
        setIsDeleting(false);
      }
    }, 2000);
  };

  return (
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
          
          <Box component="form" onSubmit={handleSubmit}>
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
          </Box>
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
      
      <Divider sx={{ my: 3 }} />
      
      <Card sx={{ mt: 3, border: '2px solid #f44336' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="error">
            Danger Zone
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }} className="text-dark">
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main', textAlign: 'center' }}>⚠️ Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, mb: 2, textAlign: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            To confirm, please enter this random number: <strong style={{ fontSize: '1.2em', color: '#f44336' }}>{randomNumber}</strong>
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              We will send an OTP to your registered email: <strong>{user.email}</strong>
            </Typography>
            <Button 
              variant="outlined" 
              onClick={sendOtp}
              disabled={sendingOtp || otpSent}
              fullWidth
              sx={{ mb: 2 }}
            >
              {sendingOtp ? 'Sending OTP...' : otpSent ? 'OTP Sent ✓' : 'Send OTP to Email'}
            </Button>
          </Box>
          
          <TextField
            fullWidth
            label="Enter OTP from email"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            disabled={isDeleting || !otpSent}
            sx={{ mt: 2 }}
          />
          
          <TextField
            fullWidth
            label="Enter the random number"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isDeleting}
            sx={{ mt: 2 }}
          />
          {isDeleting && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <CircularProgress size={24} sx={{ mr: 2, color: '#f44336' }} />
              <Typography variant="body2">Deleting your account and all data...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting || userInput !== randomNumber || !otpInput || !otpSent}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;