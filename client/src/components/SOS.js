import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, Box, Alert, TextField } from '@mui/material';
import { Phone, Add } from '@mui/icons-material';
import axios from 'axios';

const SOS = ({ user }) => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [doctorContact, setDoctorContact] = useState({});
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEmergencyContacts(response.data.emergencyContacts || []);
      setDoctorContact(response.data.doctorContact || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const makeCall = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`);
    }
  };

  const sendSMS = (phoneNumber, message) => {
    if (phoneNumber) {
      window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
    }
  };

  const emergencyServices = [
    { name: 'Emergency Services', phone: '911', description: 'For life-threatening emergencies' },
    { name: 'Poison Control', phone: '1-800-222-1222', description: 'For poisoning emergencies' },
    { name: 'Crisis Hotline', phone: '988', description: 'Mental health crisis support' }
  ];

  const pregnancyEmergencySymptoms = [
    'Severe abdominal pain',
    'Heavy bleeding',
    'Severe headache with vision changes',
    'Difficulty breathing',
    'Chest pain',
    'Severe nausea and vomiting',
    'Signs of preterm labor',
    'Decreased fetal movement',
    'High fever (over 101°F)',
    'Severe swelling in face and hands'
  ];

  const handleAddContact = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedContacts = [...emergencyContacts, newContact];
      
      await axios.put('http://localhost:5000/api/profile', 
        { emergencyContacts: updatedContacts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEmergencyContacts(updatedContacts);
      setNewContact({ name: '', phone: '', relation: '' });
      setShowAddContact(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const emergencyMessage = `Emergency! This is ${user.name}. I am ${user.currentWeek} weeks pregnant and need immediate assistance. Please contact me or call emergency services.`;

  return (
    <div className="dashboard-container">
      <Typography variant="h4" gutterBottom className="text-dark">
        Emergency SOS 🚨
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚠️ For Life-Threatening Emergencies: Call 911 Immediately
        </Typography>
        <Typography variant="body2">
          If you are experiencing severe symptoms, don't hesitate to call emergency services.
        </Typography>
      </Alert>

      {/* Emergency Services */}
      <Card sx={{ mb: 3, backgroundColor: '#ffebee' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Emergency Services
          </Typography>
          {emergencyServices.map((service, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" className="text-dark">
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </Box>
              <Button
                variant="contained"
                className="sos-button"
                startIcon={<Phone />}
                onClick={() => makeCall(service.phone)}
              >
                {service.phone}
              </Button>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Doctor Contact */}
      {doctorContact.name && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom className="text-dark">
              Your Doctor
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" className="text-dark">
                  Dr. {doctorContact.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctorContact.hospital}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Phone />}
                  onClick={() => makeCall(doctorContact.phone)}
                  sx={{ mr: 1 }}
                >
                  Call
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => sendSMS(doctorContact.phone, emergencyMessage)}
                >
                  SMS
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" className="text-dark">
              Emergency Contacts
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowAddContact(true)}
            >
              Add Contact
            </Button>
          </Box>

          {showAddContact && (
            <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Relation"
                value={newContact.relation}
                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box>
                <Button variant="contained" onClick={handleAddContact} sx={{ mr: 1 }}>
                  Add
                </Button>
                <Button variant="outlined" onClick={() => setShowAddContact(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {emergencyContacts.map((contact, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" className="text-dark">
                  {contact.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contact.relation}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Phone />}
                  onClick={() => makeCall(contact.phone)}
                  sx={{ mr: 1 }}
                >
                  Call
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => sendSMS(contact.phone, emergencyMessage)}
                >
                  SMS
                </Button>
              </Box>
            </Box>
          ))}

          {emergencyContacts.length === 0 && !showAddContact && (
            <Typography variant="body2" color="text.secondary">
              No emergency contacts added yet. Click "Add Contact" to add one.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Emergency Symptoms */}
      <Card sx={{ backgroundColor: '#fff3cd' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            ⚠️ When to Seek Emergency Care
          </Typography>
          <Typography variant="body2" paragraph className="text-dark">
            Call 911 or go to the emergency room immediately if you experience:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {pregnancyEmergencySymptoms.map((symptom, index) => (
              <Typography key={index} component="li" variant="body2" className="text-dark">
                {symptom}
              </Typography>
            ))}
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }} className="text-dark">
            Trust your instincts - if something doesn't feel right, seek medical attention immediately.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOS;