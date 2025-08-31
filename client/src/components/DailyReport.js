import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Typography, Box, Card, CardContent, 
  MenuItem, Alert, Grid, Chip, LinearProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  Container, Divider, Avatar, Stack
} from '@mui/material';
import { 
  Download, TrendingUp, 
  Mood, FitnessCenter, MonitorHeart,
  Close, Insights,
  Add, CheckCircle, LocalHospital,
  Timeline, Assessment, Favorite, Delete
} from '@mui/icons-material';
import axios from 'axios';
import jsPDF from 'jspdf';
import { styled } from '@mui/system';
import SharedNavigation from './SharedNavigation';


// Enhanced Styled Components
const MainContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    zIndex: 0
  }
}));

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '16px',
  padding: '14px 32px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.3)',
  padding: '20px',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 1)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    }
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: '32px',
  marginBottom: '32px',
  border: '1px solid rgba(255,255,255,0.2)',
  position: 'relative',
  zIndex: 1
}));

const DailyReport = ({ user }) => {
  const [formData, setFormData] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    bloodSugar: '',
    weight: '',
    mood: '',
    notes: ''
  });
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [highRiskAlert, setHighRiskAlert] = useState(null);

  const moods = [
    { value: 'Happy', emoji: '😊', color: '#4CAF50' },
    { value: 'Excited', emoji: '🤩', color: '#FF9800' },
    { value: 'Calm', emoji: '😌', color: '#2196F3' },
    { value: 'Anxious', emoji: '😰', color: '#FF5722' },
    { value: 'Tired', emoji: '😴', color: '#9E9E9E' },
    { value: 'Stressed', emoji: '😓', color: '#F44336' },
    { value: 'Energetic', emoji: '💪', color: '#4CAF50' },
    { value: 'Emotional', emoji: '🥲', color: '#9C27B0' }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/daily-reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'systolic' || name === 'diastolic') {
      setFormData({
        ...formData,
        bloodPressure: { ...formData.bloodPressure, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/daily-report', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Daily report submitted successfully!');
      
      // Check for high-risk alert
      if (response.data.riskPercentage >= 61) {
        setHighRiskAlert({
          riskPercentage: response.data.riskPercentage,
          timestamp: new Date().toLocaleString(),
          message: `High Risk Alert: Your health risk is ${response.data.riskPercentage}%. Please contact your doctor immediately.`
        });
        
        // Store notification in localStorage for dashboard
        const notifications = JSON.parse(localStorage.getItem('healthNotifications') || '[]');
        notifications.unshift({
          id: Date.now(),
          type: 'HIGH_RISK',
          title: '🚨 High Risk Alert',
          message: `Health risk: ${response.data.riskPercentage}% - Contact doctor immediately`,
          timestamp: new Date().toISOString(),
          read: false
        });
        localStorage.setItem('healthNotifications', JSON.stringify(notifications.slice(0, 10))); // Keep only 10 notifications
      }
      
      setFormData({
        bloodPressure: { systolic: '', diastolic: '' },
        bloodSugar: '',
        weight: '',
        mood: '',
        notes: ''
      });
      // Add new report to existing reports instead of refetching
      setReports([...reports, response.data]);
    } catch (error) {
      setMessage('Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (report) => {
    const doc = new jsPDF();
    const date = new Date(report.date).toLocaleDateString();
    
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Maternal Health Report', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${date}`, 20, 60);
    doc.text(`Week of Pregnancy: ${report.currentWeek}`, 20, 75);
    doc.text(`Blood Pressure: ${report.bloodPressure.systolic}/${report.bloodPressure.diastolic} mmHg`, 20, 90);
    doc.text(`Blood Sugar: ${report.bloodSugar} mg/dL`, 20, 105);
    doc.text(`Weight: ${report.weight} kg`, 20, 120);
    
    const moodObj = moods.find(m => m.value === report.mood);
    doc.text(`Mood: ${report.mood} ${moodObj ? moodObj.emoji : ''}`, 20, 135);
    doc.text(`Health Score: ${report.healthScore}/100`, 20, 150);
    doc.text(`Risk Percentage: ${report.riskPercentage || 'N/A'}%`, 20, 165);
    
    doc.setFillColor(220, 220, 220);
    doc.rect(20, 175, 170, 10, 'F');
    doc.setFillColor(102, 126, 234);
    doc.rect(20, 175, 170 * (report.healthScore / 100), 10, 'F');
    
    if (report.aiReport) {
      doc.text('AI Health Analysis:', 20, 185);
      const splitText = doc.splitTextToSize(report.aiReport.substring(0, 500) + '...', 170);
      doc.text(splitText, 20, 200);
    } else if (report.notes) {
      doc.text('Notes:', 20, 185);
      const splitText = doc.splitTextToSize(report.notes, 170);
      doc.text(splitText, 20, 200);
    }
    
    doc.save(`health-report-${date}.pdf`);
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const closeReportDetails = () => {
    setDetailDialogOpen(false);
    setSelectedReport(null);
  };

  const deleteReport = async (reportIndex) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const reportToDelete = reports[reportIndex];
      console.log('Deleting report:', reportToDelete);
      
      // Remove from UI immediately
      const updatedReports = reports.filter((_, index) => index !== reportIndex);
      setReports(updatedReports);
      
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/daily-report/${reportToDelete._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Report deleted successfully!');
      } catch (error) {
        // Restore if API fails
        setReports(reports);
        setMessage('Error deleting report');
        console.error('Delete error:', error);
      }
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <>
      <SharedNavigation user={user} />
      <MainContainer>
        <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header Section */}
        <HeaderSection>
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 2 }}>
            <Avatar sx={{ 
              width: 64, 
              height: 64, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}>
              <Favorite sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: '800', 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 1
              }}>
                Health Tracker
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontWeight: '400',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                Monitor your health metrics and track your pregnancy journey
              </Typography>
            </Box>
          </Stack>
          
          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} md={3}>
              <MetricCard>
                <LocalHospital sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#333' }}>Week {user.currentWeek}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Pregnancy</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <MetricCard>
                <Assessment sx={{ fontSize: 32, color: '#764ba2', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#333' }}>{reports.length}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Reports</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <MetricCard>
                <Timeline sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#333' }}>{Math.round((user.currentWeek / 40) * 100)}%</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Progress</Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <MetricCard>
                <MonitorHeart sx={{ fontSize: 32, color: '#764ba2', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#333' }}>Healthy</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status</Typography>
              </MetricCard>
            </Grid>
          </Grid>
        </HeaderSection>

        {message && (
          <Alert 
            severity={message.includes('Error') ? 'error' : 'success'} 
            sx={{ 
              mb: 3,
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              zIndex: 1
            }}
          >
            {message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'stretch', flexWrap: 'wrap' }}>
          {/* Enhanced Input Form Section */}
          <Box sx={{ flex: 1, minWidth: '400px' }}>
            <GlassCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar sx={{ 
                    mr: 3, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 56,
                    height: 56,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Add sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: '700', color: '#333', mb: 0.5 }}>
                      New Health Entry
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Record your daily health metrics
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 4, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', height: 2 }} />
                
                <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: '#333' }}>
                        Blood Pressure (mmHg)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <StyledTextField
                            fullWidth
                            placeholder="Systolic"
                            name="systolic"
                            type="number"
                            value={formData.bloodPressure.systolic}
                            onChange={handleChange}
                            required
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <StyledTextField
                            fullWidth
                            placeholder="Diastolic"
                            name="diastolic"
                            type="number"
                            value={formData.bloodPressure.diastolic}
                            onChange={handleChange}
                            required
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: '#333' }}>
                        Blood Sugar Level (mg/dL)
                      </Typography>
                      <StyledTextField
                        fullWidth
                        placeholder="Enter value"
                        name="bloodSugar"
                        type="number"
                        value={formData.bloodSugar}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: '#333' }}>
                        Weight (kg)
                      </Typography>
                      <StyledTextField
                        fullWidth
                        placeholder="Enter weight"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: '#333' }}>
                        Current Mood
                      </Typography>
                      <StyledTextField
                        fullWidth
                        select
                        name="mood"
                        value={formData.mood}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      >
                        {moods.map((mood) => (
                          <MenuItem key={mood.value} value={mood.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ marginRight: '8px', fontSize: '18px' }}>{mood.emoji}</span>
                              {mood.value}
                            </Box>
                          </MenuItem>
                        ))}
                      </StyledTextField>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: '#333' }}>
                        Notes & Observations
                      </Typography>
                      <StyledTextField
                        fullWidth
                        placeholder="How are you feeling today? Any symptoms or concerns?"
                        name="notes"
                        multiline
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  
                  <GradientButton
                    type="submit"
                    disabled={loading}
                    fullWidth
                    sx={{ mt: 4, py: 2 }}
                    startIcon={loading ? null : <CheckCircle />}
                  >
                    {loading ? 'Submitting...' : 'Save Health Entry'}
                  </GradientButton>
                </Box>
              </CardContent>
            </GlassCard>
          </Box>
          
          {/* Enhanced Health Overview Section */}
          <Box sx={{ flex: 1, minWidth: '400px' }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <GlassCard sx={{ flex: 1 }}>
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar sx={{ 
                      mr: 3, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      width: 56,
                      height: 56,
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}>
                      <Insights sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: '700', color: '#333', mb: 0.5 }}>
                        Health Overview
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Real-time health metrics
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 4, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', height: 2 }} />
                  
                  <Grid container spacing={2} sx={{ flex: 1 }}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 3, background: 'rgba(102, 126, 234, 0.05)', borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                        <MonitorHeart sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: 'text.secondary' }}>Blood Pressure</Typography>
                        <Typography variant="h6" sx={{ color: '#667eea', fontWeight: '700' }}>
                          {formData.bloodPressure.systolic && formData.bloodPressure.diastolic 
                            ? `${formData.bloodPressure.systolic}/${formData.bloodPressure.diastolic}` 
                            : '--/--'
                          }
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ p: 3, background: 'rgba(118, 75, 162, 0.05)', borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                        <TrendingUp sx={{ fontSize: 32, color: '#764ba2', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: 'text.secondary' }}>Blood Sugar</Typography>
                        <Typography variant="h6" sx={{ color: '#764ba2', fontWeight: '700' }}>
                          {formData.bloodSugar ? `${formData.bloodSugar}` : '--'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ p: 3, background: 'rgba(102, 126, 234, 0.05)', borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                        <FitnessCenter sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: 'text.secondary' }}>Weight (kg)</Typography>
                        <Typography variant="h6" sx={{ color: '#667eea', fontWeight: '700' }}>
                          {formData.weight ? `${formData.weight}` : '--'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ p: 3, background: 'rgba(118, 75, 162, 0.05)', borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                        <Mood sx={{ fontSize: 32, color: '#764ba2', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: 'text.secondary' }}>Mood</Typography>
                        {formData.mood ? (
                          <Chip 
                            label={formData.mood} 
                            size="small"
                            sx={{ 
                              backgroundColor: moods.find(m => m.value === formData.mood)?.color || '#764ba2',
                              color: 'white',
                              fontWeight: '600'
                            }} 
                          />
                        ) : (
                          <Typography variant="h6" sx={{ color: '#764ba2', fontWeight: '700' }}>--</Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </GlassCard>
              
              <GlassCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocalHospital sx={{ mr: 2, color: '#667eea', fontSize: '28px' }} />
                    <Typography variant="h5" sx={{ fontWeight: '600', color: '#333' }}>
                      Pregnancy Progress
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: '800', color: '#667eea', mb: 1 }}>
                      {user.currentWeek}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                      Weeks of Pregnancy
                    </Typography>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={(user.currentWeek / 40) * 100} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6, 
                        mb: 2,
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 6,
                        }
                      }} 
                    />
                    
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: '500' }}>
                      {user.currentWeek <= 12 
                        ? "First Trimester: Focus on nutrition and rest"
                        : user.currentWeek <= 28 
                        ? "Second Trimester: Great time for gentle exercise"
                        : "Third Trimester: Prepare for delivery"
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </GlassCard>
            </Stack>
          </Box>
        </Box>

        {/* Enhanced Reports Section */}
        <Box sx={{ mt: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: '700', 
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Health History
            </Typography>
            
            {reports.length > 0 && (
              <GlassCard sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Download sx={{ color: '#667eea' }} />
                  <Typography variant="body2" sx={{ fontWeight: '600', color: '#333' }}>
                    Download Reports:
                  </Typography>
                  <Button 
                    size="small"
                    onClick={() => {
                      reports.forEach((report, index) => {
                        setTimeout(() => generatePDF(report), index * 500);
                      });
                    }}
                    startIcon={<Download />}
                    sx={{ 
                      borderRadius: '12px', 
                      textTransform: 'none',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      }
                    }}
                  >
                    All ({reports.length})
                  </Button>
                </Box>
              </GlassCard>
            )}
          </Box>
          
          {reports.length === 0 ? (
            <GlassCard>
              <CardContent sx={{ p: 6, textAlign: 'center' }}>
                <MonitorHeart sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ color: 'text.secondary', mb: 2, fontWeight: '600' }}>
                  No health reports yet
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Submit your first health report to start tracking your pregnancy journey.
                </Typography>
              </CardContent>
            </GlassCard>
          ) : (
            <Grid container spacing={3}>
              {reports.map((report, index) => {
                const moodObj = moods.find(m => m.value === report.mood);
                return (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <GlassCard>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: '600', mb: 0.5 }}>
                              {new Date(report.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Week {report.currentWeek}
                            </Typography>
                          </Box>
                          
                          <Chip 
                            label={report.mood} 
                            size="small"
                            sx={{ 
                              backgroundColor: moodObj?.color || '#667eea',
                              color: 'white',
                              fontWeight: '600'
                            }} 
                          />
                        </Box>
                        
                        <Stack spacing={2} sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Blood Pressure</Typography>
                            <Typography variant="body2" sx={{ fontWeight: '600' }}>
                              {report.bloodPressure.systolic}/{report.bloodPressure.diastolic}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Blood Sugar</Typography>
                            <Typography variant="body2" sx={{ fontWeight: '600' }}>
                              {report.bloodSugar} mg/dL
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Weight</Typography>
                            <Typography variant="body2" sx={{ fontWeight: '600' }}>
                              {report.weight} kg
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">Health Score</Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: '600',
                              color: getHealthScoreColor(report.healthScore)
                            }}>
                              {report.healthScore}/100
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={report.healthScore} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getHealthScoreColor(report.healthScore),
                                borderRadius: 3,
                              }
                            }} 
                          />
                        </Box>
                        
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            onClick={() => openReportDetails(report)}
                            startIcon={<Insights />}
                            sx={{ 
                              borderRadius: '12px', 
                              textTransform: 'none',
                              fontWeight: '600'
                            }}
                          >
                            Details
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => generatePDF(report)}
                            startIcon={<Download />}
                            variant="contained"
                            sx={{ 
                              borderRadius: '12px', 
                              textTransform: 'none',
                              fontWeight: '600',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                              }
                            }}
                          >
                            📄 PDF
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => deleteReport(index)}
                            startIcon={<Delete />}
                            color="error"
                            sx={{ 
                              borderRadius: '12px', 
                              textTransform: 'none',
                              fontWeight: '600'
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </CardContent>
                    </GlassCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
        
        {/* Enhanced Report Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={closeReportDetails} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '24px 24px 0 0',
            py: 3
          }}>
            <Typography variant="h5" sx={{ fontWeight: '600' }}>Health Report Details</Typography>
            <IconButton onClick={closeReportDetails} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {selectedReport && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: '600', mb: 1 }}>
                      {new Date(selectedReport.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Week {selectedReport.currentWeek} of Pregnancy
                    </Typography>
                  </Box>
                  <Chip 
                    label={selectedReport.mood} 
                    sx={{ 
                      backgroundColor: moods.find(m => m.value === selectedReport.mood)?.color || '#667eea',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }} 
                  />
                </Box>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 3, background: 'rgba(102, 126, 234, 0.05)', borderRadius: '16px' }}>
                      <MonitorHeart sx={{ fontSize: 36, color: '#667eea', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: '700', mb: 1 }}>
                        {selectedReport.bloodPressure.systolic}/{selectedReport.bloodPressure.diastolic}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Blood Pressure
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 3, background: 'rgba(118, 75, 162, 0.05)', borderRadius: '16px' }}>
                      <TrendingUp sx={{ fontSize: 36, color: '#764ba2', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: '700', mb: 1 }}>
                        {selectedReport.bloodSugar}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Blood Sugar (mg/dL)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 3, background: 'rgba(102, 126, 234, 0.05)', borderRadius: '16px' }}>
                      <FitnessCenter sx={{ fontSize: 36, color: '#667eea', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: '700', mb: 1 }}>
                        {selectedReport.weight}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Weight (kg)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 3, background: 'rgba(118, 75, 162, 0.05)', borderRadius: '16px' }}>
                      <Assessment sx={{ fontSize: 36, color: '#764ba2', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: '700', mb: 1 }}>
                        {selectedReport.healthScore}/100
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Health Score
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 3, background: 'rgba(244, 67, 54, 0.05)', borderRadius: '16px' }}>
                      <MonitorHeart sx={{ fontSize: 36, color: '#f44336', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: '700', mb: 1 }}>
                        {selectedReport.riskPercentage || 'N/A'}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Risk Level
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {selectedReport.aiReport && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: '600', mb: 2 }}>
                      🤖 AI Health Analysis
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', background: 'rgba(102, 126, 234, 0.05)' }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {selectedReport.aiReport}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {selectedReport.notes && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: '600', mb: 2 }}>
                      📝 Your Notes
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', background: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="body1">
                        {selectedReport.notes}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={closeReportDetails} sx={{ borderRadius: '12px', textTransform: 'none' }}>
              Close
            </Button>
            <GradientButton 
              onClick={() => generatePDF(selectedReport)} 
              startIcon={<Download />}
            >
              Download PDF
            </GradientButton>
          </DialogActions>
        </Dialog>
        
        {/* High Risk Alert Dialog */}
        <Dialog 
          open={!!highRiskAlert} 
          onClose={() => setHighRiskAlert(null)}
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
              color: 'white'
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            py: 3,
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            🚨 HIGH RISK ALERT
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
            {highRiskAlert && (
              <>
                <Typography variant="h4" sx={{ fontWeight: '800', mb: 2 }}>
                  {highRiskAlert.riskPercentage}%
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: '600' }}>
                  RISK LEVEL
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Your health metrics indicate a high-risk condition. Please contact your healthcare provider immediately for evaluation.
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Alert generated: {highRiskAlert.timestamp}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={() => setHighRiskAlert(null)}
              variant="contained"
              sx={{ 
                borderRadius: '12px', 
                textTransform: 'none',
                fontWeight: '600',
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              I Understand
            </Button>
          </DialogActions>
        </Dialog>
        </Container>
      </MainContainer>
    </>
  );
};

export default DailyReport;