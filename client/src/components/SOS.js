import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Button, Card, CardContent, Box, Alert, TextField, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Phone, Add, LocationOn } from '@mui/icons-material';
import axios from 'axios';
import SharedNavigation from './SharedNavigation';

const SOS = ({ user }) => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [doctorContact, setDoctorContact] = useState({});
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '', countryCode: '+1' });
  const [userLocation, setUserLocation] = useState(null);
  const [locationBasedServices, setLocationBasedServices] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showEditDoctor, setShowEditDoctor] = useState(false);
  const [editDoctor, setEditDoctor] = useState({ name: '', phone: '', hospital: '', countryCode: '+1' });
  const [editingContactIndex, setEditingContactIndex] = useState(-1);
  const [editContact, setEditContact] = useState({ name: '', phone: '', relation: '', countryCode: '+1' });
  
  const countryCodes = [
    { code: '+1', country: 'US/CA', maxLength: 10 },
    { code: '+91', country: 'India', maxLength: 10 },
    { code: '+44', country: 'UK', maxLength: 10 },
    { code: '+61', country: 'Australia', maxLength: 9 },
    { code: '+33', country: 'France', maxLength: 10 },
    { code: '+49', country: 'Germany', maxLength: 11 },
    { code: '+81', country: 'Japan', maxLength: 11 },
    { code: '+86', country: 'China', maxLength: 11 }
  ];

  const getCurrentLocationAndServices = useCallback(() => {
    setLoadingLocation(true);
    
    if (!navigator.geolocation) {
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        await getLocationBasedServices(location);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    fetchUserProfile();
    getCurrentLocationAndServices();
  }, [getCurrentLocationAndServices]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEmergencyContacts(response.data.emergencyContacts || []);
      const doctor = response.data.doctorContact || {};
      setDoctorContact(doctor);
      setEditDoctor({ 
        name: doctor.name || '', 
        phone: doctor.phone || '', 
        hospital: doctor.hospital || '', 
        countryCode: doctor.countryCode || '+1' 
      });
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



  const getLocationBasedServices = async (location) => {
    try {
      // Get country/region from coordinates using reverse geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`);
      const data = await response.json();
      
      const country = data.address?.country || 'Unknown';
      const countryCode = data.address?.country_code?.toLowerCase() || 'us';
      
      console.log('Detected country:', country, countryCode);
      
      // Set emergency services based on location
      const services = getEmergencyServicesByCountry(countryCode, country);
      setLocationBasedServices(services);
      
    } catch (error) {
      console.error('Error getting location services:', error);
      // Fallback to US services
      setLocationBasedServices(getEmergencyServicesByCountry('us', 'United States'));
    }
  };

  const getEmergencyServicesByCountry = (countryCode, countryName) => {
    const emergencyNumbers = {
      'us': [
        { name: 'Emergency Services', phone: '911', description: 'Police, Fire, Medical emergencies' },
        { name: 'Poison Control', phone: '1-800-222-1222', description: 'Poisoning emergencies' },
        { name: 'Crisis Hotline', phone: '988', description: 'Mental health crisis support' }
      ],
      'in': [
        { name: 'Emergency Services', phone: '112', description: 'All emergency services' },
        { name: 'Police', phone: '100', description: 'Police emergency' },
        { name: 'Fire Brigade', phone: '101', description: 'Fire emergency' },
        { name: 'Ambulance', phone: '108', description: 'Medical emergency' },
        { name: 'Women Helpline', phone: '1091', description: 'Women in distress' }
      ],
      'gb': [
        { name: 'Emergency Services', phone: '999', description: 'Police, Fire, Ambulance' },
        { name: 'NHS 111', phone: '111', description: 'Non-emergency medical advice' },
        { name: 'Samaritans', phone: '116 123', description: 'Emotional support' }
      ],
      'ca': [
        { name: 'Emergency Services', phone: '911', description: 'Police, Fire, Medical emergencies' },
        { name: 'Poison Control', phone: '1-844-764-7669', description: 'Poisoning emergencies' },
        { name: 'Crisis Services', phone: '1-833-456-4566', description: 'Mental health crisis' }
      ],
      'au': [
        { name: 'Emergency Services', phone: '000', description: 'Police, Fire, Ambulance' },
        { name: 'Poison Information', phone: '13 11 26', description: 'Poisoning emergencies' },
        { name: 'Lifeline', phone: '13 11 14', description: 'Crisis support' }
      ]
    };
    
    return emergencyNumbers[countryCode] || emergencyNumbers['us'];
  };

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
      setNewContact({ name: '', phone: '', relation: '', countryCode: '+1' });
      setShowAddContact(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleEditDoctor = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put('http://localhost:5000/api/profile', 
        { doctorContact: editDoctor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDoctorContact(editDoctor);
      setShowEditDoctor(false);
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  };

  const handleEditContact = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedContacts = [...emergencyContacts];
      updatedContacts[editingContactIndex] = editContact;
      
      await axios.put('http://localhost:5000/api/profile', 
        { emergencyContacts: updatedContacts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEmergencyContacts(updatedContacts);
      setEditingContactIndex(-1);
      setEditContact({ name: '', phone: '', relation: '', countryCode: '+1' });
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const emergencyMessage = `Emergency! This is ${user.name}. I am ${user.currentWeek} weeks pregnant and need immediate assistance. Please contact me or call emergency services.`;

  return (
    <>
      <SharedNavigation user={user} />
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

      {/* Location-Based Emergency Services */}
      <Card sx={{ mb: 3, backgroundColor: '#ffebee' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" className="text-dark" sx={{ mr: 1 }}>
              Emergency Services
            </Typography>
            <LocationOn sx={{ color: '#ff6b9d', mr: 1 }} />
            {userLocation && (
              <Typography variant="body2" color="text.secondary">
                Location-based numbers
              </Typography>
            )}
          </Box>
          
          {loadingLocation && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Getting emergency numbers for your location...
              </Typography>
            </Box>
          )}
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<LocationOn />}
            onClick={getCurrentLocationAndServices}
            sx={{ mb: 2 }}
            disabled={loadingLocation}
          >
            {loadingLocation ? 'Updating...' : 'Update Location'}
          </Button>
          
          {locationBasedServices.map((service, index) => (
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" className="text-dark">
              Your Doctor
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowEditDoctor(true)}
            >
              {doctorContact.name ? 'Edit' : 'Add Doctor'}
            </Button>
          </Box>

          {showEditDoctor && (
            <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <TextField
                fullWidth
                label="Doctor Name"
                value={editDoctor.name}
                onChange={(e) => setEditDoctor({ ...editDoctor, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={editDoctor.countryCode}
                    label="Country"
                    onChange={(e) => setEditDoctor({ ...editDoctor, countryCode: e.target.value, phone: '' })}
                  >
                    {countryCodes.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.code} ({country.country})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editDoctor.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const selectedCountry = countryCodes.find(c => c.code === editDoctor.countryCode);
                    if (value.length <= selectedCountry.maxLength) {
                      setEditDoctor({ ...editDoctor, phone: value });
                    }
                  }}
                  placeholder={`Enter ${countryCodes.find(c => c.code === editDoctor.countryCode)?.maxLength} digits`}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Box>
              <TextField
                fullWidth
                label="Hospital/Clinic"
                value={editDoctor.hospital}
                onChange={(e) => setEditDoctor({ ...editDoctor, hospital: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box>
                <Button variant="contained" onClick={handleEditDoctor} sx={{ mr: 1 }}>
                  Save
                </Button>
                <Button variant="outlined" onClick={() => setShowEditDoctor(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {doctorContact.name && !showEditDoctor && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" className="text-dark">
                  Dr. {doctorContact.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctorContact.hospital}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctorContact.countryCode}{doctorContact.phone ? ' ' + doctorContact.phone : ''}
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
          )}

          {!doctorContact.name && !showEditDoctor && (
            <Typography variant="body2" color="text.secondary">
              No doctor contact added yet. Click "Add Doctor" to add your doctor's information.
            </Typography>
          )}
        </CardContent>
      </Card>

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
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={newContact.countryCode}
                    label="Country"
                    onChange={(e) => setNewContact({ ...newContact, countryCode: e.target.value, phone: '' })}
                  >
                    {countryCodes.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.code} ({country.country})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={newContact.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const selectedCountry = countryCodes.find(c => c.code === newContact.countryCode);
                    if (value.length <= selectedCountry.maxLength) {
                      setNewContact({ ...newContact, phone: value });
                    }
                  }}
                  placeholder={`Enter ${countryCodes.find(c => c.code === newContact.countryCode)?.maxLength} digits`}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Box>
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
            <Box key={index} sx={{ mb: 2 }}>
              {editingContactIndex === index ? (
                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={editContact.name}
                    onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Country</InputLabel>
                      <Select
                        value={editContact.countryCode}
                        label="Country"
                        onChange={(e) => setEditContact({ ...editContact, countryCode: e.target.value, phone: '' })}
                      >
                        {countryCodes.map((country) => (
                          <MenuItem key={country.code} value={country.code}>
                            {country.code} ({country.country})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={editContact.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const selectedCountry = countryCodes.find(c => c.code === editContact.countryCode);
                        if (value.length <= selectedCountry.maxLength) {
                          setEditContact({ ...editContact, phone: value });
                        }
                      }}
                      placeholder={`Enter ${countryCodes.find(c => c.code === editContact.countryCode)?.maxLength} digits`}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Relation"
                    value={editContact.relation}
                    onChange={(e) => setEditContact({ ...editContact, relation: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Box>
                    <Button variant="contained" onClick={handleEditContact} sx={{ mr: 1 }}>
                      Save
                    </Button>
                    <Button variant="outlined" onClick={() => setEditingContactIndex(-1)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" className="text-dark">
                      {contact.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contact.relation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contact.countryCode}{contact.phone ? ' ' + contact.phone : ''}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setEditingContactIndex(index);
                        setEditContact({ 
                          name: contact.name || '', 
                          phone: contact.phone || '', 
                          relation: contact.relation || '', 
                          countryCode: contact.countryCode || '+1' 
                        });
                      }}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
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
              )}
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
    </>
  );
};

export default SOS;