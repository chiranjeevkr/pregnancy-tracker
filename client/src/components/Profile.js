import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Card, CardContent, Alert, Avatar, Grid } from '@mui/material';
import { Person, Email, Phone, CalendarToday, LocalHospital, ContactPhone, Add, Save, Edit } from '@mui/icons-material';
import { styled } from '@mui/system';
import axios from 'axios';
import SharedNavigation from './SharedNavigation';

const ProfileContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  background: `
    linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
    url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGZ1bHRlciBpZD0iYmx1ciI+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMwIi8+CjwvZmlsdGVyPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N2VlYTtzdG9wLW9wYWNpdHk6MC44Ii8+CjxzdG9wIG9mZnNldD0iMjUlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjA5M2ZiO3N0b3Atb3BhY2l0eTowLjciLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWQ2ZTM7c3RvcC1vcGFjaXR5OjAuNiIvPgo8c3RvcCBvZmZzZXQ9Ijc1JSIgc3R5bGU9InN0b3AtY29sb3I6I2E4ZWRlYTtzdG9wLW9wYWNpdHk6MC43Ii8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izc2NGJhMjtzdG9wLW9wYWNpdHk6MC44Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgZmlsdGVyPSJ1cmwoI2JsdXIpIi8+CjxjaXJjbGUgY3g9IjE2MDAiIGN5PSIzMDAiIHI9IjIwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgZmlsdGVyPSJ1cmwoI2JsdXIpIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjcwMCIgcj0iMTgwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDkpIiBmaWx0ZXI9InVybCgjYmx1cikiLz4KPGNpcmNsZSBjeD0iMTQwMCIgY3k9IjgwMCIgcj0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBmaWx0ZXI9InVybCgjYmx1cikiLz4KPGNpcmNsZSBjeD0iODAwIiBjeT0iNDAwIiByPSIxNjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiIGZpbHRlcj0idXJsKCNibHVyKSIvPgo8L3N2Zz4K')
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  minHeight: '100vh'
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover fieldset': {
      borderColor: '#667eea',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#2c2c2c',
    '&.Mui-focused': {
      color: '#667eea',
    },
  },
}));

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
    if (formData.emergencyContacts.length < 5) {
      setFormData({
        ...formData,
        emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', relation: '' }]
      });
    }
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
      <SharedNavigation user={user} onLogout={onLogout} />
      <ProfileContainer>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              mx: 'auto', 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '2.5rem'
            }}
          >
            {formData.name.charAt(0) || user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="h4" sx={{ 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            My Profile
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.7)' }}>
            Week {formData.currentWeek} of your pregnancy journey 🌸
          </Typography>
        </Box>

        {message && (
          <Alert 
            severity={message.includes('Error') ? 'error' : 'success'} 
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {message}
          </Alert>
        )}

        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Grid container spacing={3} justifyContent="center">
            {/* Personal Information */}
            <Grid item xs={12} md={4}>
            <GlassCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ color: '#667eea', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: '600', color: '#2c2c2c' }}>
                    Personal Information
                  </Typography>
                </Box>
                
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Person sx={{ color: '#667eea', mr: 1 }} />
                  }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Email sx={{ color: '#667eea', mr: 1 }} />
                  }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Phone sx={{ color: '#667eea', mr: 1 }} />
                  }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Current Week of Pregnancy"
                  name="currentWeek"
                  type="number"
                  value={formData.currentWeek}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 40 }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ color: '#667eea', mr: 1 }} />
                  }}
                />
              </CardContent>
            </GlassCard>
          </Grid>

          {/* Doctor Contact */}
          <Grid item xs={12} md={4}>
            <GlassCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocalHospital sx={{ color: '#667eea', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: '600', color: '#2c2c2c' }}>
                    Doctor Contact
                  </Typography>
                </Box>
                
                <StyledTextField
                  fullWidth
                  label="Doctor Name"
                  name="doctor-name"
                  value={formData.doctorContact.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Person sx={{ color: '#667eea', mr: 1 }} />
                  }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Doctor Phone"
                  name="doctor-phone"
                  value={formData.doctorContact.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Phone sx={{ color: '#667eea', mr: 1 }} />
                  }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Hospital Name"
                  name="doctor-hospital"
                  value={formData.doctorContact.hospital}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <LocalHospital sx={{ color: '#667eea', mr: 1 }} />
                  }}
                />
              </CardContent>
            </GlassCard>
          </Grid>

          {/* Emergency Contacts */}
          <Grid item xs={12} md={4}>
            <GlassCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ContactPhone sx={{ color: '#667eea', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: '600', color: '#2c2c2c' }}>
                      Emergency Contacts
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    startIcon={<Add />}
                    onClick={addEmergencyContact}
                    sx={{ 
                      borderColor: '#667eea',
                      color: '#667eea',
                      borderRadius: '12px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#5a6fd8',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    Add Contact
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  {formData.emergencyContacts.map((contact, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Box sx={{ 
                        p: 2, 
                        border: '2px solid rgba(102, 126, 234, 0.2)', 
                        borderRadius: '16px',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        position: 'relative'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#667eea', 
                          fontWeight: '600', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <ContactPhone sx={{ mr: 1, fontSize: 20 }} />
                          Contact {index + 1}
                        </Typography>
                        
                        <StyledTextField
                          fullWidth
                          label="Contact Name"
                          name={`emergency-${index}-name`}
                          value={contact.name}
                          onChange={handleChange}
                          size="small"
                          InputProps={{
                            startAdornment: <Person sx={{ color: '#667eea', mr: 1 }} />
                          }}
                        />
                        
                        <StyledTextField
                          fullWidth
                          label="Phone Number"
                          name={`emergency-${index}-phone`}
                          value={contact.phone}
                          onChange={handleChange}
                          size="small"
                          InputProps={{
                            startAdornment: <Phone sx={{ color: '#667eea', mr: 1 }} />
                          }}
                        />
                        
                        <StyledTextField
                          fullWidth
                          label="Relation"
                          name={`emergency-${index}-relation`}
                          value={contact.relation}
                          onChange={handleChange}
                          size="small"
                          InputProps={{
                            startAdornment: <ContactPhone sx={{ color: '#667eea', mr: 1 }} />
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </GlassCard>
          </Grid>
          </Grid>
        </Box>

        {/* Save Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleSubmit}
            startIcon={loading ? <Edit /> : <Save />}
            sx={{
              borderRadius: '25px',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {loading ? 'Updating Profile...' : 'Save Changes'}
          </Button>
        </Box>
      </ProfileContainer>
    </>
  );
};

export default Profile;