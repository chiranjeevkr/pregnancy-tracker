import React, { useState } from 'react';
import {
  Box, Button, Typography, Card, CardContent, CircularProgress,
  Alert, Chip, Grid, LinearProgress
} from '@mui/material';
import { Watch, Bluetooth, Sync, CheckCircle, Error } from '@mui/icons-material';
import { styled } from '@mui/system';

const WearableCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}));

const WearableSync = ({ onDataFetched }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState('');

  // Simulate wearable device connection
  const connectToWearable = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth not supported in this browser');
      }

      // Request device (this would connect to actual smartwatch)
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'Galaxy Watch' },
          { namePrefix: 'Apple Watch' },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Garmin' }
        ],
        optionalServices: ['battery_service', 'device_information']
      });

      setDeviceName(device.name);
      setIsConnected(true);
      
    } catch (err) {
      // Fallback for demo purposes
      setTimeout(() => {
        setDeviceName('Galaxy Watch 4');
        setIsConnected(true);
      }, 2000);
    }
    
    setIsConnecting(false);
  };

  // Fetch health data from wearable
  const syncHealthData = async () => {
    if (!isConnected) return;
    
    setIsSyncing(true);
    setError('');

    try {
      // Simulate API call to wearable device
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock health data (in real implementation, this would come from the device)
      const mockData = {
        bloodPressure: {
          systolic: Math.floor(Math.random() * (140 - 110) + 110),
          diastolic: Math.floor(Math.random() * (90 - 70) + 70),
          timestamp: new Date().toISOString()
        },
        bloodSugar: {
          level: Math.floor(Math.random() * (120 - 80) + 80),
          unit: 'mg/dL',
          timestamp: new Date().toISOString()
        },
        heartRate: Math.floor(Math.random() * (100 - 60) + 60),
        lastSync: new Date().toLocaleString()
      };

      setHealthData(mockData);
      
      // Pass data to parent component
      if (onDataFetched) {
        onDataFetched({
          systolicBP: mockData.bloodPressure.systolic,
          diastolicBP: mockData.bloodPressure.diastolic,
          bloodSugar: mockData.bloodSugar.level
        });
      }

    } catch (err) {
      setError('Failed to sync data from wearable device');
    }
    
    setIsSyncing(false);
  };

  return (
    <WearableCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            p: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Watch sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: '700', color: '#2c2c2c' }}>
              Wearable Device Sync
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
              Connect your smartwatch to auto-fill health data
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {!isConnected ? (
          <Button
            variant="contained"
            startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : <Bluetooth />}
            onClick={connectToWearable}
            disabled={isConnecting}
            fullWidth
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1.1rem',
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wearable Device'}
          </Button>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: '600' }}>
                Connected to {deviceName}
              </Typography>
              <Chip 
                label="Connected" 
                size="small" 
                sx={{ 
                  ml: 'auto', 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  fontWeight: '600'
                }} 
              />
            </Box>

            <Button
              variant="contained"
              startIcon={isSyncing ? <CircularProgress size={20} color="inherit" /> : <Sync />}
              onClick={syncHealthData}
              disabled={isSyncing}
              fullWidth
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1.1rem',
                py: 1.5,
                mb: 2,
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0f8a7c 0%, #32d96a 100%)',
                }
              }}
            >
              {isSyncing ? 'Syncing Data...' : 'Sync Health Data'}
            </Button>

            {isSyncing && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: 'rgba(0,0,0,0.6)' }}>
                  Fetching data from {deviceName}...
                </Typography>
                <LinearProgress 
                  sx={{ 
                    borderRadius: '4px',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                    }
                  }} 
                />
              </Box>
            )}

            {healthData && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 2, color: '#667eea' }}>
                  📊 Synced Health Data
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: '700', color: '#d32f2f' }}>
                        {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                        Blood Pressure (mmHg)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: '700', color: '#ff9800' }}>
                        {healthData.bloodSugar.level}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                        Blood Sugar ({healthData.bloodSugar.unit})
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 2, 
                  color: 'rgba(0,0,0,0.5)',
                  fontStyle: 'italic'
                }}>
                  Last synced: {healthData.lastSync}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </WearableCard>
  );
};

export default WearableSync;