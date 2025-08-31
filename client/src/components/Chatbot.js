import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, Typography, Box, Paper, Tabs, Tab, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Rating } from '@mui/material';
import { Send, History, Chat, ThumbUp, ThumbDown } from '@mui/icons-material';
import axios from 'axios';
import SharedNavigation from './SharedNavigation';

const Chatbot = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m Dr. AI, your pregnancy doctor. I\'m here to help answer your questions and give you simple, easy-to-understand advice.\n\nI can help with:\n• Pregnancy symptoms\n• What to eat and avoid\n• Safe exercises\n• When to call your doctor\n• Common pregnancy concerns\n\nRemember: I give general advice, but always talk to your own doctor about your specific situation.\n\nWhat would you like to know about your pregnancy?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(3);
  const [feedbackText, setFeedbackText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    fetchChatHistory();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistory(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chatbot',
        { message: inputMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage = { 
        type: 'bot', 
        text: response.data.response,
        trainingId: response.data.trainingId 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        type: 'bot', 
        text: 'I apologize, but I\'m having trouble responding right now. Please try again later or consult with your healthcare provider for urgent concerns.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (trainingId, isHelpful) => {
    setSelectedTrainingId(trainingId);
    setFeedbackRating(isHelpful ? 4 : 2);
    setFeedbackDialog(true);
  };

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const feedback = feedbackRating >= 3 ? 'helpful' : 'not_helpful';
      
      await axios.post(
        'http://localhost:5000/api/ai-feedback',
        {
          trainingId: selectedTrainingId,
          feedback,
          accuracy: feedbackRating,
          suggestions: feedbackText
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setFeedbackDialog(false);
      setFeedbackText('');
      setSelectedTrainingId(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'I feel sick and can\'t eat anything',
    'Is it safe to exercise?',
    'What foods should I avoid?',
    'My back hurts, is this normal?',
    'How much weight should I gain?',
    'I feel worried about my pregnancy',
    'Can I take medicine while pregnant?',
    'I have headaches often',
    'I have heartburn, what helps?',
    'I\'m constipated, what can I do?',
    'My discharge looks different',
    'I feel dizzy sometimes',
    'My baby isn\'t moving much today',
    'My hands and feet are swollen'
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      <SharedNavigation user={user} onLogout={onLogout} />
      <div className="chatbot-container">
      <Typography variant="h4" gutterBottom className="text-dark">
        Dr. AI - Maternal Health Consultant 👩‍⚕️
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Chat />} label="Current Chat" />
          <Tab icon={<History />} label="Chat History" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Paper className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <Typography variant="body1">
                  {message.text}
                </Typography>
                {message.type === 'bot' && message.trainingId && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleFeedback(message.trainingId, true)}
                      sx={{ color: 'green' }}
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleFeedback(message.trainingId, false)}
                      sx={{ color: 'red' }}
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </div>
            ))}
            {loading && (
              <div className="message bot-message">
                <Typography variant="body1">
                  Dr. AI is analyzing your question...
                </Typography>
              </div>
            )}
            <div ref={messagesEndRef} />
          </Paper>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom className="text-dark">
              Common Maternal Health Questions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickQuestion(question)}
                  sx={{ mb: 1 }}
                >
                  {question}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Describe your symptoms or ask any pregnancy-related question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              InputLabelProps={{ style: { color: '#2c2c2c' } }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="submit-button"
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <Send />
            </Button>
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom className="text-dark">
            Your Medical Consultation History
          </Typography>
          {chatHistory.length === 0 ? (
            <Typography variant="body2" className="text-dark">
              No previous consultations found.
            </Typography>
          ) : (
            chatHistory.map((chat, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(chat.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1, color: '#ff6b9d' }}>
                    Your Question:
                  </Typography>
                  <Typography variant="body2" paragraph className="text-dark">
                    {chat.question}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#2e7d32' }}>
                    Dr. AI's Response:
                  </Typography>
                  <Typography variant="body2" className="text-dark">
                    {chat.answer}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      <Typography variant="caption" sx={{ mt: 2, display: 'block' }} className="text-dark">
        ⚠️ Medical Disclaimer: Dr. AI provides general medical information based on common pregnancy guidelines. This is not a substitute for professional medical advice. Always consult your healthcare provider for personalized medical guidance and urgent concerns.
      </Typography>

      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)}>
        <DialogTitle>Help Improve Dr. AI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            How helpful was this response?
          </Typography>
          <Rating
            value={feedbackRating}
            onChange={(event, newValue) => setFeedbackRating(newValue)}
            size="large"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Any suggestions to improve the response?"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={submitFeedback} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
};

export default Chatbot;