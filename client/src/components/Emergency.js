import React, { useState } from 'react';
import { Typography, Card, CardContent, Button, Box, Alert, CircularProgress } from '@mui/material';
import { LocationOn, LocalHospital, ChildCare, Directions } from '@mui/icons-material';
import SharedNavigation from './SharedNavigation';

const Emergency = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  const findNearbyHospitals = () => {
    setLoading(true);
    setError('');
    setHospitals([]);
    
    if (!navigator.geolocation) {
      setError('GPS not supported. Please use a modern browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(location);
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/emergency-hospitals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              lat: location.lat,
              lng: location.lng,
              radius: 20
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to find hospitals');
          }
          
          const data = await response.json();
          setHospitals([...data.maternalHospitals, ...data.ivfCenters]);
          
          if (data.maternalHospitals.length === 0 && data.ivfCenters.length === 0) {
            setError('No hospitals found within 20km radius.');
          }
          
        } catch (err) {
          setError(`Failed to find hospitals: ${err.message}`);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        let message = 'Location Error: ';
        switch (error.code) {
          case 1:
            message += 'Please allow location access.';
            break;
          case 2:
            message += 'GPS unavailable.';
            break;
          case 3:
            message += 'Location timeout.';
            break;
          default:
            message += 'Unknown GPS error.';
        }
        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const getDirections = (hospital) => {
    if (!userLocation) {
      alert('Please get your location first');
      return;
    }
    
    const hospitalLat = hospital.lat;
    const hospitalLng = hospital.lng;
    
    window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospitalLat},${hospitalLng}`, '_blank');
  };

  return (
    <div className="dashboard-container">
      <SharedNavigation user={user} onLogout={onLogout} />
      
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center', color: '#d32f2f' }}>
        🚨 Emergency Hospital Finder
      </Typography>

      <Card sx={{ mb: 3, backgroundColor: '#ffebee', borderRadius: '16px' }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d32f2f' }}>
            Find Nearby Hospitals (20km radius)
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocationOn />}
            onClick={findNearbyHospitals}
            disabled={loading}
            sx={{ 
              backgroundColor: '#d32f2f', 
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '12px',
              '&:hover': { backgroundColor: '#b71c1c' }
            }}
          >
            {loading ? 'Finding Hospitals...' : 'Get My Location & Find Hospitals'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {hospitals.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#d32f2f' }}>
            Nearby Hospitals ({hospitals.length})
          </Typography>
          
          {hospitals.map((hospital, index) => (
            <Card key={index} sx={{ mb: 2, borderRadius: '12px', boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {hospital.type === 'ivf' ? 
                        <ChildCare sx={{ color: '#2196f3', mr: 1 }} /> : 
                        <LocalHospital sx={{ color: '#e91e63', mr: 1 }} />
                      }
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {hospital.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📍 {hospital.address}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      🚗 {hospital.distance}km away
                    </Typography>
                    
                    {hospital.phone && (
                      <Typography variant="body2" color="text.secondary">
                        📞 {hospital.phone}
                      </Typography>
                    )}
                  </Box>
                  
                  <Button
                    variant="contained"
                    startIcon={<Directions />}
                    onClick={() => getDirections(hospital)}
                    sx={{ 
                      backgroundColor: '#2196f3',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#1976d2' }
                    }}
                  >
                    Get Directions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
};

export default Emergency;