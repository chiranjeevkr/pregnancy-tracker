import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Card, CardContent, Button, Box, TextField, List, ListItem, ListItemText } from '@mui/material';
import { LocationOn, Phone, Language, Directions } from '@mui/icons-material';

const HospitalMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample hospital data (in a real app, this would come from an API)
  const sampleHospitals = useMemo(() => [
    {
      id: 1,
      name: 'City General Hospital',
      address: '123 Main St, Downtown',
      phone: '(555) 123-4567',
      website: 'https://citygeneral.com',
      specialties: ['Obstetrics', 'Gynecology', 'Pediatrics'],
      distance: '2.3 miles',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Women\'s Health Center',
      address: '456 Oak Ave, Midtown',
      phone: '(555) 234-5678',
      website: 'https://womenshealthcenter.com',
      specialties: ['Maternal-Fetal Medicine', 'High-Risk Pregnancy', 'NICU'],
      distance: '3.1 miles',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Regional Medical Center',
      address: '789 Pine Rd, Uptown',
      phone: '(555) 345-6789',
      website: 'https://regionalmedical.com',
      specialties: ['Emergency Care', 'Labor & Delivery', 'Postpartum Care'],
      distance: '4.2 miles',
      rating: 4.3
    },
    {
      id: 4,
      name: 'Mercy Hospital',
      address: '321 Elm St, Westside',
      phone: '(555) 456-7890',
      website: 'https://mercyhospital.com',
      specialties: ['Family Medicine', 'Obstetrics', 'Newborn Care'],
      distance: '5.0 miles',
      rating: 4.6
    }
  ], []);

  useEffect(() => {
    getCurrentLocation();
    setHospitals(sampleHospitals);
  }, [sampleHospitals]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const searchHospitals = () => {
    setLoading(true);
    // In a real app, this would make an API call to search for hospitals
    setTimeout(() => {
      setHospitals(sampleHospitals);
      setLoading(false);
    }, 1000);
  };

  const openDirections = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const callHospital = (phone) => {
    window.open(`tel:${phone}`);
  };

  const visitWebsite = (website) => {
    window.open(website, '_blank');
  };

  return (
    <div className="dashboard-container">
      <Typography variant="h4" gutterBottom className="text-dark">
        Find Nearby Hospitals 🏥
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Search for Hospitals
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Enter your location or zip code"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="e.g., New York, NY or 10001"
              InputLabelProps={{ style: { color: '#2c2c2c' } }}
            />
            <Button
              variant="contained"
              onClick={searchHospitals}
              disabled={loading}
              className="submit-button"
              sx={{ minWidth: '120px' }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
          
          {userLocation && (
            <Typography variant="body2" color="text.secondary">
              📍 Using your current location for nearby results
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map Placeholder */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Hospital Locations Map
          </Typography>
          <Box 
            className="hospital-map"
            sx={{ 
              backgroundColor: '#f0f0f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed #ccc'
            }}
          >
            <Typography variant="body1" className="text-dark">
              🗺️ Interactive map would be displayed here
              <br />
              (Integration with Google Maps or similar service)
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }} className="text-dark">
            Click on hospital markers to view details and get directions
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom className="text-dark">
        Nearby Hospitals & Clinics
      </Typography>

      {hospitals.map((hospital) => (
        <Card key={hospital.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" className="text-dark">
                  {hospital.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                  {hospital.address}
                </Typography>
                <Typography variant="body2" className="text-dark">
                  Distance: {hospital.distance} | Rating: ⭐ {hospital.rating}/5
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: '120px' }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Phone />}
                  onClick={() => callHospital(hospital.phone)}
                  className="submit-button"
                >
                  Call
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Directions />}
                  onClick={() => openDirections(hospital.address)}
                >
                  Directions
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Language />}
                  onClick={() => visitWebsite(hospital.website)}
                >
                  Website
                </Button>
              </Box>
            </Box>

            <Typography variant="subtitle2" gutterBottom className="text-dark">
              Specialties:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {hospital.specialties.map((specialty, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: '#e3f2fd',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem'
                  }}
                >
                  {specialty}
                </Box>
              ))}
            </Box>

            <Typography variant="body2" className="text-dark">
              📞 {hospital.phone}
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Card sx={{ mt: 3, backgroundColor: '#e8f5e8' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            💡 Tips for Choosing a Hospital
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Check if your insurance is accepted"
                primaryTypographyProps={{ className: 'text-dark' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Look for hospitals with NICU facilities"
                primaryTypographyProps={{ className: 'text-dark' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Consider the hospital's delivery and postpartum policies"
                primaryTypographyProps={{ className: 'text-dark' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Schedule a tour of the maternity ward"
                primaryTypographyProps={{ className: 'text-dark' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Check reviews and ratings from other patients"
                primaryTypographyProps={{ className: 'text-dark' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalMap;