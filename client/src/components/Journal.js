import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Card, CardContent, TextField, Button, 
  Grid, Avatar, IconButton, Dialog, DialogContent, DialogActions,
  Chip, Alert
} from '@mui/material';
import { 
  PhotoCamera, Edit, Save, Delete, Timeline, Close, PlayArrow, Pause, SkipNext, SkipPrevious, Download
} from '@mui/icons-material';
import { styled } from '@mui/system';
import axios from 'axios';
import SharedNavigation from './SharedNavigation';

const JournalContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  background: `
    linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
    url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGZ1bHRlciBpZD0iYmx1ciI+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMwIi8+CjwvZmlsdGVyPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N2VlYTtzdG9wLW9wYWNpdHk6MC44Ii8+CjxzdG9wIG9mZnNldD0iMjUlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjA5M2ZiO3N0b3Atb3BhY2l0eTowLjciLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWQ2ZTM7c3RvcC1vcGFjaXR5OjAuNiIvPgo8c3RvcCBvZmZzZXQ9Ijc1JSIgc3R5bGU9InN0b3AtY29sb3I6I2E4ZWRlYTtzdG9wLW9wYWNpdHk6MC43Ii8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izc2NGJhMjtzdG9wLW9wYWNpdHk6MC44Ci8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgZmlsdGVyPSJ1cmwoI2JsdXIpIi8+CjxjaXJjbGUgY3g9IjE2MDAiIGN5PSIzMDAiIHI9IjIwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgZmlsdGVyPSJ1cmwoI2JsdXIpIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjcwMCIgcj0iMTgwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDkpIiBmaWx0ZXI9InVybCgjYmx1cikiLz4KPGNpcmNsZSBjeD0iMTQwMCIgY3k9IjgwMCIgcj0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBmaWx0ZXI9InVybCgjYmx1cikiLz4KPGNpcmNsZSBjeD0iODAwIiBjeT0iNDAwIiByPSIxNjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiIGZpbHRlcj0idXJsKCNibHVyKSIvPgo8L3N2Zz4K')
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

const Journal = ({ user, onLogout }) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({ note: '', photo: null, week: user?.currentWeek || 1 });
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [message, setMessage] = useState('');
  const [slideshowDialog, setSlideshowDialog] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/journal', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (error) {
      console.error('Error loading entries:', error);
      setMessage('Error loading journal entries');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 1MB)
      if (file.size > 1024 * 1024) {
        setMessage('Image too large. Please choose a smaller image (max 1MB)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        // Compress image
        compressImage(e.target.result, (compressedImage) => {
          setSelectedImage(compressedImage);
          setCurrentEntry({ ...currentEntry, photo: compressedImage });
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (src, callback) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Resize to max 400x400
      const maxSize = 400;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality
    };
    
    img.src = src;
  };

  const saveEntry = async () => {
    if (!currentEntry.note.trim() && !currentEntry.photo) {
      setMessage('Please add a note or photo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/journal', {
        note: currentEntry.note,
        photo: currentEntry.photo,
        week: user?.currentWeek || 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEntries([response.data, ...entries]);
      setCurrentEntry({ note: '', photo: null, week: user?.currentWeek || 1 });
      setSelectedImage(null);
      setMessage('Memory saved successfully! 💕');
    } catch (error) {
      console.error('Error saving entry:', error);
      setMessage('Error saving memory. Please try again.');
    }
  };

  const deleteEntry = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/journal/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEntries(entries.filter(entry => entry._id !== id));
      setViewDialog(false);
      setMessage('Memory deleted');
    } catch (error) {
      console.error('Error deleting entry:', error);
      setMessage('Error deleting memory');
    }
  };

  const startSlideshow = () => {
    const photosWithEntries = entries.filter(entry => entry.photo);
    if (photosWithEntries.length === 0) return;
    
    setCurrentSlide(0);
    setSlideshowDialog(true);
    setIsPlaying(true);
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % photosWithEntries.length;
        return next;
      });
    }, 3000); // 3 seconds per slide
    
    setSlideshowInterval(interval);
  };

  const pauseSlideshow = () => {
    setIsPlaying(false);
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      setSlideshowInterval(null);
    }
  };

  const resumeSlideshow = () => {
    const photosWithEntries = entries.filter(entry => entry.photo);
    setIsPlaying(true);
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % photosWithEntries.length;
        return next;
      });
    }, 3000);
    
    setSlideshowInterval(interval);
  };

  const nextSlide = () => {
    const photosWithEntries = entries.filter(entry => entry.photo);
    setCurrentSlide(prev => (prev + 1) % photosWithEntries.length);
  };

  const prevSlide = () => {
    const photosWithEntries = entries.filter(entry => entry.photo);
    setCurrentSlide(prev => (prev - 1 + photosWithEntries.length) % photosWithEntries.length);
  };

  const closeSlideshowDialog = () => {
    setSlideshowDialog(false);
    setIsPlaying(false);
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      setSlideshowInterval(null);
    }
  };

  const generateAndDownloadVideo = async () => {
    const photosWithEntries = entries.filter(entry => entry.photo);
    if (photosWithEntries.length === 0) return;
    
    setIsGeneratingVideo(true);
    setMessage('Generating video... Please wait');
    
    try {
      // Create canvas for video frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1280;
      canvas.height = 720;
      
      const frames = [];
      const frameDuration = 3000; // 3 seconds per slide
      const fps = 30;
      const framesPerSlide = (frameDuration / 1000) * fps;
      
      // Generate frames for each photo
      for (let i = 0; i < photosWithEntries.length; i++) {
        const entry = photosWithEntries[i];
        
        // Load image
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = entry.photo;
        });
        
        // Create frames for this slide
        for (let frame = 0; frame < framesPerSlide; frame++) {
          // Clear canvas with gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(1, '#764ba2');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw image (centered and scaled)
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > canvasAspect) {
            drawWidth = canvas.width * 0.6;
            drawHeight = drawWidth / imgAspect;
          } else {
            drawHeight = canvas.height * 0.6;
            drawWidth = drawHeight * imgAspect;
          }
          
          drawX = (canvas.width - drawWidth) / 2;
          drawY = (canvas.height - drawHeight) / 2 - 50;
          
          // Add white background for image
          ctx.fillStyle = 'white';
          ctx.fillRect(drawX - 10, drawY - 10, drawWidth + 20, drawHeight + 20);
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          // Add text overlay
          ctx.fillStyle = 'white';
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Week ${entry.week}`, canvas.width / 2, 80);
          
          ctx.font = '24px Arial';
          ctx.fillText(new Date(entry.date).toLocaleDateString(), canvas.width / 2, 120);
          
          if (entry.note) {
            ctx.font = '28px Arial';
            const maxWidth = canvas.width - 100;
            const words = entry.note.split(' ');
            let line = '';
            let y = drawY + drawHeight + 80;
            
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              const testWidth = metrics.width;
              
              if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, canvas.width / 2, y);
                line = words[n] + ' ';
                y += 35;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, canvas.width / 2, y);
          }
          
          // Convert canvas to blob and store frame
          const frameBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.8);
          });
          frames.push(frameBlob);
        }
      }
      
      // Create video using MediaRecorder (simplified approach)
      // For a more robust solution, you'd use FFmpeg.js or similar
      const videoBlob = await createVideoFromFrames(frames, fps);
      
      // Download video
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pregnancy-journey-${user?.name || 'memories'}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('Video downloaded successfully! 🎥');
    } catch (error) {
      console.error('Video generation error:', error);
      setMessage('Error generating video. Please try again.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };
  
  const createVideoFromFrames = async (frames, fps) => {
    // Simple approach: create a WebM video using MediaRecorder
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;
    
    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      recorder.start();
      
      let frameIndex = 0;
      const playFrames = async () => {
        if (frameIndex < frames.length) {
          const img = new Image();
          const url = URL.createObjectURL(frames[frameIndex]);
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            frameIndex++;
            
            setTimeout(playFrames, 1000 / fps);
          };
          
          img.src = url;
        } else {
          recorder.stop();
        }
      };
      
      playFrames();
    });
  };

  useEffect(() => {
    return () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
      }
    };
  }, [slideshowInterval]);

  return (
    <>
      <SharedNavigation user={user} onLogout={onLogout} />
      <JournalContainer>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50px',
            p: 2,
            mb: 3,
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
          }}>
            <Typography variant="h2" sx={{ color: 'white', fontSize: '2.5rem' }}>📸</Typography>
          </Box>
          <Typography variant="h3" sx={{ 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: '2.5rem'
          }}>
            My Pregnancy Journal
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'rgba(0,0,0,0.6)', 
            fontWeight: '400',
            maxWidth: '500px',
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Capture your beautiful journey, week by week. Create lasting memories of this special time.
          </Typography>
        </Box>

        {message && (
          <Alert 
            severity={message.includes('Error') ? 'error' : 'success'} 
            sx={{ mb: 3, borderRadius: '12px' }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          <Grid container spacing={4}>
          {/* Add New Entry */}
          <Grid item xs={12} lg={6}>
            <GlassCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 2,
                  borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    p: 1.5,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Edit sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: '700', color: '#2c2c2c', mb: 0.5 }}>
                      Week {user?.currentWeek} Memory
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>

                <StyledTextField
                  fullWidth
                  multiline
                  rows={5}
                  label="How are you feeling today? Share your thoughts..."
                  value={currentEntry.note}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, note: e.target.value })}
                  placeholder="Today I felt amazing... My baby kicked for the first time... I'm grateful for this beautiful journey..."
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      lineHeight: 1.6
                    }
                  }}
                />

                <Box sx={{ mb: 4 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      size="large"
                      sx={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        borderRadius: '15px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 3,
                        borderWidth: '2px',
                        '&:hover': {
                          borderColor: '#5a6fd8',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          borderWidth: '2px'
                        }
                      }}
                    >
                       Add Photo
                    </Button>
                  </label>
                  
                  {selectedImage && (
                    <Box sx={{ 
                      mt: 3, 
                      textAlign: 'center',
                      p: 2,
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '16px',
                      border: '2px dashed rgba(102, 126, 234, 0.3)'
                    }}>
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '250px', 
                          borderRadius: '12px',
                          objectFit: 'cover',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                        }} 
                      />
                      <Typography variant="caption" sx={{ 
                        display: 'block', 
                        mt: 1, 
                        color: 'rgba(0,0,0,0.6)',
                        fontStyle: 'italic'
                      }}>
                        Beautiful! This memory will be saved forever 💕
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={saveEntry}
                  size="large"
                  fullWidth
                  sx={{
                    borderRadius: '15px',
                    textTransform: 'none',
                    fontSize: '1.2rem',
                    py: 1.5,
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Save This Beautiful Memory
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>

          {/* Memory Timeline */}
          <Grid item xs={12} lg={6}>
            <GlassCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 4,
                  pb: 2,
                  borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Timeline sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: '700', color: '#2c2c2c', mb: 0.5 }}>
                        Memory Timeline
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                        {entries.length} precious memories saved
                      </Typography>
                    </Box>
                  </Box>
                  {entries.filter(e => e.photo).length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PlayArrow />}
                        onClick={() => startSlideshow()}
                        sx={{
                          borderColor: '#667eea',
                          color: '#667eea',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          px: 2,
                          '&:hover': {
                            borderColor: '#5a6fd8',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        🎥 Play
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={generateAndDownloadVideo}
                        disabled={isGeneratingVideo}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          px: 2,
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            background: 'rgba(102, 126, 234, 0.5)'
                          }
                        }}
                      >
                        {isGeneratingVideo ? '⏳ Creating...' : '💾 Download'}
                      </Button>
                    </Box>
                  )}
                </Box>

                <Box sx={{ 
                  maxHeight: '500px', 
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '10px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px'
                  }
                }}>
                  {entries.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '16px',
                      border: '2px dashed rgba(102, 126, 234, 0.2)'
                    }}>
                      <Typography variant="h2" sx={{ mb: 2 }}>🌱</Typography>
                      <Typography variant="h6" sx={{ color: '#667eea', fontWeight: '600', mb: 1 }}>
                        Your Journey Starts Here
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                        No memories yet. Start capturing your beautiful pregnancy journey! 💕
                      </Typography>
                    </Box>
                  ) : (
                    entries.map((entry) => (
                      <Card 
                        key={entry._id || entry.id}
                        sx={{ 
                          mb: 3, 
                          borderRadius: '16px',
                          cursor: 'pointer',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)',
                            border: '1px solid rgba(102, 126, 234, 0.3)'
                          }
                        }}
                        onClick={() => {
                          setSelectedEntry(entry);
                          setViewDialog(true);
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={`Week ${entry.week}`}
                                sx={{ 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  fontWeight: '700',
                                  fontSize: '0.85rem'
                                }}
                              />
                              <Typography variant="caption" sx={{ 
                                color: 'rgba(0,0,0,0.5)',
                                fontWeight: '500'
                              }}>
                                {new Date(entry.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </Typography>
                            </Box>
                            {entry.photo && (
                              <Box sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '8px',
                                p: 0.5,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <PhotoCamera sx={{ color: 'white', fontSize: 16 }} />
                              </Box>
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {entry.photo && (
                              <Avatar 
                                src={entry.photo}
                                sx={{ 
                                  width: 60, 
                                  height: 60, 
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                              />
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" sx={{ 
                                color: '#2c2c2c',
                                fontWeight: '500',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {entry.note || '📷 Photo memory - click to view'}
                              </Typography>
                              {entry.note && entry.note.length > 100 && (
                                <Typography variant="caption" sx={{ 
                                  color: '#667eea',
                                  fontWeight: '600',
                                  mt: 0.5,
                                  display: 'block'
                                }}>
                                  Click to read more...
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
          </Grid>
        </Box>

        {/* Slideshow Dialog */}
        <Dialog
          open={slideshowDialog}
          onClose={closeSlideshowDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              minHeight: '80vh'
            }
          }}
        >
          <DialogContent sx={{ p: 0, position: 'relative', minHeight: '70vh' }}>
            {entries.filter(entry => entry.photo).length > 0 && (
              <Box sx={{ 
                position: 'relative', 
                height: '70vh', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                  <IconButton 
                    onClick={generateAndDownloadVideo}
                    disabled={isGeneratingVideo}
                    sx={{ 
                      color: 'white',
                      mr: 1,
                      '&:disabled': { color: 'rgba(255,255,255,0.5)' }
                    }}
                    title="Download Video"
                  >
                    <Download />
                  </IconButton>
                  <IconButton 
                    onClick={closeSlideshowDialog}
                    sx={{ color: 'white' }}
                  >
                    <Close />
                  </IconButton>
                </Box>
                
                {/* Current Slide */}
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'white',
                  maxWidth: '90%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#667eea', mb: 1 }}>
                      Week {entries.filter(entry => entry.photo)[currentSlide]?.week}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {new Date(entries.filter(entry => entry.photo)[currentSlide]?.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={entries.filter(entry => entry.photo)[currentSlide]?.photo}
                      alt="Memory"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '12px',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                  
                  {entries.filter(entry => entry.photo)[currentSlide]?.note && (
                    <Typography variant="body1" sx={{ 
                      color: 'white',
                      fontStyle: 'italic',
                      maxWidth: '600px',
                      mx: 'auto',
                      lineHeight: 1.6
                    }}>
                      "{entries.filter(entry => entry.photo)[currentSlide]?.note}"
                    </Typography>
                  )}
                </Box>
                
                {/* Navigation Controls */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 20, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '25px',
                  p: 1
                }}>
                  <IconButton onClick={prevSlide} sx={{ color: 'white' }}>
                    <SkipPrevious />
                  </IconButton>
                  
                  <IconButton 
                    onClick={isPlaying ? pauseSlideshow : resumeSlideshow}
                    sx={{ color: 'white' }}
                  >
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>
                  
                  <IconButton onClick={nextSlide} sx={{ color: 'white' }}>
                    <SkipNext />
                  </IconButton>
                  
                  <Typography variant="caption" sx={{ color: 'white', ml: 2 }}>
                    {currentSlide + 1} / {entries.filter(entry => entry.photo).length}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* View Entry Dialog */}
        <Dialog 
          open={viewDialog} 
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            {selectedEntry && (
              <Box>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  p: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>
                      Week {selectedEntry.week} Memory
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {new Date(selectedEntry.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton 
                    onClick={() => setViewDialog(false)}
                    sx={{ color: 'white' }}
                  >
                    <Close />
                  </IconButton>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  {selectedEntry.photo && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <img 
                        src={selectedEntry.photo} 
                        alt="Memory" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px',
                          borderRadius: '12px',
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                  )}
                  
                  {selectedEntry.note && (
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.6,
                      color: '#2c2c2c',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedEntry.note}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => selectedEntry && deleteEntry(selectedEntry._id || selectedEntry.id)}
              startIcon={<Delete />}
              sx={{ 
                color: '#ff4444',
                borderRadius: '12px',
                textTransform: 'none'
              }}
            >
              Delete Memory
            </Button>
            <Button
              onClick={() => setViewDialog(false)}
              variant="contained"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </JournalContainer>
    </>
  );
};

export default Journal;