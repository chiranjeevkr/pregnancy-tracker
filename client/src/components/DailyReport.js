import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Typography, Box, Card, CardContent, 
  MenuItem, Alert, Grid, Chip, LinearProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  Tabs, Tab, Divider, useTheme
} from '@mui/material';
import { 
  Download, TrendingUp, CalendarToday, 
  Mood, FitnessCenter, MonitorHeart,
  Close, Insights, HealthAndSafety,
  Add, CheckCircle, LocalHospital,
  ArrowForward, ArrowBack
} from '@mui/icons-material';
import axios from 'axios';
import jsPDF from 'jspdf';
import { styled } from '@mui/system';

// Styled components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.25)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 28px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(106, 17, 203, 0.4)',
  },
}));

const MetricIndicator = styled(Box)(({ theme, value, max }) => ({
  height: '8px',
  borderRadius: '4px',
  background: `linear-gradient(90deg, #6A11CB 0%, #2575FC ${(value/max)*100}%, #f0f0f0 ${(value/max)*100}%, #f0f0f0 100%)`,
  marginTop: '8px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    right: '0',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#2575FC',
    boxShadow: '0 0 0 3px rgba(37, 117, 252, 0.2)',
  }
}));

const DailyReport = ({ user }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    bloodSugar: '',
    weight: '',
    currentWeek: user.currentWeek,
    mood: '',
    situation: ''
  });
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
      await axios.post('http://localhost:5000/api/daily-report', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Daily report submitted successfully!');
      setFormData({
        bloodPressure: { systolic: '', diastolic: '' },
        bloodSugar: '',
        weight: '',
        currentWeek: user.currentWeek,
        mood: '',
        situation: ''
      });
      fetchReports();
    } catch (error) {
      setMessage('Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (report) => {
    const doc = new jsPDF();
    const date = new Date(report.date).toLocaleDateString();
    
    // Add header with gradient background
    doc.setFillColor(106, 17, 203);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Maternal Health Report', 105, 25, { align: 'center' });
    
    // Report content
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${date}`, 20, 60);
    doc.text(`Week of Pregnancy: ${report.currentWeek}`, 20, 75);
    doc.text(`Blood Pressure: ${report.bloodPressure.systolic}/${report.bloodPressure.diastolic} mmHg`, 20, 90);
    doc.text(`Blood Sugar: ${report.bloodSugar} mg/dL`, 20, 105);
    doc.text(`Weight: ${report.weight} kg`, 20, 120);
    
    // Mood with emoji
    const moodObj = moods.find(m => m.value === report.mood);
    doc.text(`Mood: ${report.mood} ${moodObj ? moodObj.emoji : ''}`, 20, 135);
    doc.text(`Health Score: ${report.healthScore}/100`, 20, 150);
    
    // Health score visualization
    doc.setFillColor(220, 220, 220);
    doc.rect(20, 160, 170, 10, 'F');
    doc.setFillColor(106, 17, 203);
    doc.rect(20, 160, 170 * (report.healthScore / 100), 10, 'F');
    
    doc.text('Situation Notes:', 20, 185);
    const splitText = doc.splitTextToSize(report.situation, 170);
    doc.text(splitText, 20, 200);
    
    // Health recommendations
    doc.setFont(undefined, 'bold');
    doc.text('Recommendations:', 20, 230);
    doc.setFont(undefined, 'normal');
    
    let recommendations = [];
    if (report.bloodPressure.systolic > 140) {
      recommendations.push('• Monitor blood pressure closely and consult your doctor');
    }
    if (report.bloodSugar > 140) {
      recommendations.push('• Monitor blood sugar levels and follow dietary guidelines');
    }
    if (report.mood === 'Stressed' || report.mood === 'Anxious') {
      recommendations.push('• Practice relaxation techniques and consider prenatal yoga');
    }
    if (recommendations.length === 0) {
      recommendations.push('• Continue maintaining your healthy lifestyle');
    }
    
    recommendations.forEach((rec, index) => {
      doc.text(rec, 20, 245 + (index * 10));
    });
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by PregnancyCare App', 105, 280, { align: 'center' });
    
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

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh',
      fontFamily: '"Inter", "Roboto", sans-serif'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ 
          fontWeight: '700', 
          background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          Health Tracker
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: '400' }}>
          Monitor your health metrics and track your pregnancy journey
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ 
          mb: 4, 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Input Form Section */}
        <Grid item xs={12} lg={8}>
          <GlassCard>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Add sx={{ 
                  mr: 2, 
                  background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
                  borderRadius: '50%',
                  padding: '8px',
                  color: 'white',
                  fontSize: '32px'
                }} />
                <Typography variant="h5" sx={{ fontWeight: '600' }}>
                  New Health Entry
                </Typography>
              </Box>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '600' }}>
                      Blood Pressure (mmHg)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          placeholder="Systolic"
                          name="systolic"
                          type="number"
                          value={formData.bloodPressure.systolic}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          size="medium"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          placeholder="Diastolic"
                          name="diastolic"
                          type="number"
                          value={formData.bloodPressure.diastolic}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          size="medium"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    {formData.bloodPressure.systolic && formData.bloodPressure.diastolic && (
                      <MetricIndicator 
                        value={formData.bloodPressure.systolic} 
                        max={180} 
                      />
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '600' }}>
                      Blood Sugar Level (mg/dL)
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter value"
                      name="bloodSugar"
                      type="number"
                      value={formData.bloodSugar}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    />
                    {formData.bloodSugar && (
                      <MetricIndicator 
                        value={formData.bloodSugar} 
                        max={200} 
                      />
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '600' }}>
                      Weight (kg)
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    />
                    {formData.weight && (
                      <MetricIndicator 
                        value={formData.weight} 
                        max={100} 
                      />
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '600' }}>
                      Current Mood
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      name="mood"
                      value={formData.mood}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    >
                      {moods.map((mood) => (
                        <MenuItem key={mood.value} value={mood.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '12px', fontSize: '20px' }}>{mood.emoji}</span>
                            {mood.value}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '600' }}>
                      Notes & Observations
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="How are you feeling today? Any symptoms or concerns?"
                      name="situation"
                      multiline
                      rows={4}
                      value={formData.situation}
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <GradientButton
                  type="submit"
                  disabled={loading}
                  fullWidth
                  sx={{ mt: 4, py: 1.5 }}
                  startIcon={loading ? null : <CheckCircle />}
                >
                  {loading ? 'Submitting...' : 'Save Health Entry'}
                </GradientButton>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>
        
        {/* Sidebar Section */}
        <Grid item xs={12} lg={4}>
          <GlassCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Insights sx={{ mr: 2, color: '#6A11CB' }} />
                <Typography variant="h6" sx={{ fontWeight: '600' }}>
                  Health Overview
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>Blood Pressure</Typography>
                  <Typography variant="body2" sx={{ color: '#6A11CB', fontWeight: '600' }}>
                    {formData.bloodPressure.systolic && formData.bloodPressure.diastolic 
                      ? `${formData.bloodPressure.systolic}/${formData.bloodPressure.diastolic}` 
                      : '--/--'
                    }
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>Blood Sugar</Typography>
                  <Typography variant="body2" sx={{ color: '#6A11CB', fontWeight: '600' }}>
                    {formData.bloodSugar ? `${formData.bloodSugar} mg/dL` : '--'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>Weight</Typography>
                  <Typography variant="body2" sx={{ color: '#6A11CB', fontWeight: '600' }}>
                    {formData.weight ? `${formData.weight} kg` : '--'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>Mood</Typography>
                  {formData.mood ? (
                    <Chip 
                      size="small" 
                      label={formData.mood} 
                      sx={{ 
                        backgroundColor: moods.find(m => m.value === formData.mood)?.color || '#6A11CB',
                        color: 'white',
                        fontWeight: '500'
                      }} 
                    />
                  ) : (
                    <Typography variant="body2">--</Typography>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalHospital sx={{ mr: 2, color: '#6A11CB' }} />
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>
                    Pregnancy Week {user.currentWeek}
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={(user.currentWeek / 40) * 100} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    mb: 1,
                    backgroundColor: 'rgba(106, 17, 203, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
                      borderRadius: 4,
                    }
                  }} 
                />
                
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
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
          
          <GlassCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HealthAndSafety sx={{ mr: 2, color: '#6A11CB' }} />
                <Typography variant="h6" sx={{ fontWeight: '600' }}>
                  Health Tips
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, background: 'rgba(106, 17, 203, 0.05)', borderRadius: '12px', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: '500', mb: 1 }}>
                  💡 Stay Hydrated
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  Drink at least 8-10 glasses of water daily to support your increased blood volume.
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, background: 'rgba(106, 17, 203, 0.05)', borderRadius: '12px' }}>
                <Typography variant="body2" sx={{ fontWeight: '500', mb: 1 }}>
                  🍎 Healthy Snacking
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  Keep healthy snacks handy to maintain energy levels and manage nausea.
                </Typography>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Reports Section */}
      <Box sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: '600' }}>
            Health History
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <IconButton size="small">
              <ArrowForward />
            </IconButton>
          </Box>
        </Box>
        
        {reports.length === 0 ? (
          <GlassCard>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <MonitorHeart sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                No health reports yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Submit your first health report to start tracking your pregnancy journey.
              </Typography>
            </CardContent>
          </GlassCard>
        ) : (
          <Grid container spacing={3}>
            {reports.slice(0, 3).map((report, index) => {
              const moodObj = moods.find(m => m.value === report.mood);
              return (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <GlassCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: '600', mb: 0.5 }}>
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
                            backgroundColor: moodObj?.color || '#6A11CB',
                            color: 'white',
                            fontWeight: '500'
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Blood Pressure</Typography>
                          <Typography variant="body2" sx={{ fontWeight: '600' }}>
                            {report.bloodPressure.systolic}/{report.bloodPressure.diastolic}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                      </Box>
                      
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
                            backgroundColor: 'rgba(106, 17, 203, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getHealthScoreColor(report.healthScore),
                              borderRadius: 3,
                            }
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          size="small" 
                          onClick={() => openReportDetails(report)}
                          startIcon={<Insights />}
                          sx={{ borderRadius: '8px' }}
                        >
                          Details
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => generatePDF(report)}
                          startIcon={<Download />}
                          sx={{ borderRadius: '8px' }}
                        >
                          Export
                        </Button>
                      </Box>
                    </CardContent>
                  </GlassCard>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
      
      {/* Report Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={closeReportDetails} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0'
        }}>
          <Typography variant="h6">Health Report Details</Typography>
          <IconButton onClick={closeReportDetails} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedReport && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                    {new Date(selectedReport.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Week {selectedReport.currentWeek} of Pregnancy
                  </Typography>
                </Box>
                <Chip 
                  label={selectedReport.mood} 
                  sx={{ 
                    backgroundColor: moods.find(m => m.value === selectedReport.mood)?.color || '#6A11CB',
                    color: 'white',
                    fontWeight: '500'
                  }} 
                />
              </Box>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(106, 17, 203, 0.05)', borderRadius: '12px' }}>
                    <MonitorHeart sx={{ fontSize: 32, color: '#6A11CB', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>
                      {selectedReport.bloodPressure.systolic}/{selectedReport.bloodPressure.diastolic}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Blood Pressure
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(106, 17, 203, 0.05)', borderRadius: '12px' }}>
                    <TrendingUp sx={{ fontSize: 32, color: '#6A11CB', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>
                      {selectedReport.bloodSugar}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Blood Sugar (mg/dL)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(106, 17, 203, 0.05)', borderRadius: '12px' }}>
                    <FitnessCenter sx={{ fontSize: 32, color: '#6A11CB', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>
                      {selectedReport.weight}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Weight (kg)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(106, 17, 203, 0.05)', borderRadius: '12px' }}>
                    <Mood sx={{ fontSize: 32, color: '#6A11CB', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>
                      {selectedReport.healthScore}/100
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Health Score
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {selectedReport.situation && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 2 }}>
                    Notes
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
                    <Typography variant="body2">
                      {selectedReport.situation}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={closeReportDetails} sx={{ borderRadius: '8px' }}>
            Close
          </Button>
          <Button 
            onClick={() => generatePDF(selectedReport)} 
            variant="contained"
            startIcon={<Download />}
            sx={{ borderRadius: '8px' }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyReport;