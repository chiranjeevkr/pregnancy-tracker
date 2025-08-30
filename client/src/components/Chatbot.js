import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, Typography, Box, Paper, Tabs, Tab, Card, CardContent } from '@mui/material';
import { Send, History, Chat } from '@mui/icons-material';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m Dr. AI, your virtual pregnancy healthcare provider. I\'m here to provide medical guidance and answer your maternal health questions. How can I assist you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
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

      const botMessage = { type: 'bot', text: response.data.response };
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'I have morning sickness, what should I do?',
    'Is it safe to exercise during pregnancy?',
    'What foods should I avoid during pregnancy?',
    'I have back pain, is this normal?',
    'How much weight should I gain?',
    'I feel anxious about my pregnancy',
    'What medications are safe during pregnancy?',
    'I have headaches, should I be worried?'
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
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
    </div>
  );
};

export default Chatbot;