import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Card, CardContent, MenuItem, Alert } from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';

const DailyReport = ({ user }) => {
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

  const moods = [
    'Happy', 'Excited', 'Calm', 'Anxious', 'Tired', 'Stressed', 'Energetic', 'Emotional'
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
    
    doc.setFontSize(20);
    doc.text('Maternal Health Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 50);
    doc.text(`Week of Pregnancy: ${report.currentWeek}`, 20, 65);
    doc.text(`Blood Pressure: ${report.bloodPressure.systolic}/${report.bloodPressure.diastolic} mmHg`, 20, 80);
    doc.text(`Blood Sugar: ${report.bloodSugar} mg/dL`, 20, 95);
    doc.text(`Weight: ${report.weight} kg`, 20, 110);
    doc.text(`Mood: ${report.mood}`, 20, 125);
    doc.text(`Health Score: ${report.healthScore}/100`, 20, 140);
    
    doc.text('Situation Notes:', 20, 160);
    const splitText = doc.splitTextToSize(report.situation, 170);
    doc.text(splitText, 20, 175);
    
    // Health recommendations
    doc.text('Recommendations:', 20, 200);
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
      doc.text(rec, 20, 215 + (index * 10));
    });
    
    doc.save(`health-report-${date}.pdf`);
  };

  return (
    <div className="dashboard-container">
      <Typography variant="h4" gutterBottom className="text-dark">
        Daily Health Report
      </Typography>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Today's Health Metrics
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Systolic BP"
                name="systolic"
                type="number"
                value={formData.bloodPressure.systolic}
                onChange={handleChange}
                required
                InputLabelProps={{ style: { color: '#2c2c2c' } }}
              />
              <TextField
                label="Diastolic BP"
                name="diastolic"
                type="number"
                value={formData.bloodPressure.diastolic}
                onChange={handleChange}
                required
                InputLabelProps={{ style: { color: '#2c2c2c' } }}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Blood Sugar Level (mg/dL)"
              name="bloodSugar"
              type="number"
              value={formData.bloodSugar}
              onChange={handleChange}
              required
              className="form-input"
              InputLabelProps={{ style: { color: '#2c2c2c' } }}
            />
            
            <TextField
              fullWidth
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              required
              className="form-input"
              InputLabelProps={{ style: { color: '#2c2c2c' } }}
            />
            
            <TextField
              fullWidth
              select
              label="Current Mood"
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              required
              className="form-input"
              InputLabelProps={{ style: { color: '#2c2c2c' } }}
            >
              {moods.map((mood) => (
                <MenuItem key={mood} value={mood}>
                  {mood}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Situation Notes"
              name="situation"
              multiline
              rows={4}
              value={formData.situation}
              onChange={handleChange}
              placeholder="Describe how you're feeling today, any symptoms, or concerns..."
              className="form-input"
              InputLabelProps={{ style: { color: '#2c2c2c' } }}
            />
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom className="text-dark">
        Previous Reports
      </Typography>
      
      {reports.map((report, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" className="text-dark">
                {new Date(report.date).toLocaleDateString()}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => generatePDF(report)}
                size="small"
              >
                Download PDF
              </Button>
            </Box>
            
            <Typography variant="body2" className="text-dark">
              <strong>Week:</strong> {report.currentWeek} | 
              <strong> BP:</strong> {report.bloodPressure.systolic}/{report.bloodPressure.diastolic} | 
              <strong> Sugar:</strong> {report.bloodSugar} mg/dL | 
              <strong> Weight:</strong> {report.weight} kg | 
              <strong> Mood:</strong> {report.mood}
            </Typography>
            
            <Typography variant="body2" sx={{ mt: 1 }} className="text-dark">
              <strong>Health Score:</strong> {report.healthScore}/100
            </Typography>
            
            {report.situation && (
              <Typography variant="body2" sx={{ mt: 1 }} className="text-dark">
                <strong>Notes:</strong> {report.situation}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DailyReport;