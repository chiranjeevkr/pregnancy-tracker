import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, Box, Paper, Chip, LinearProgress, Tabs, Tab } from '@mui/material';
import { Refresh, EmojiEvents, Psychology, Spa, FavoriteRounded, Star, Air, PlayArrow, Pause } from '@mui/icons-material';
import { styled, keyframes } from '@mui/system';
import SharedNavigation from './SharedNavigation';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const GameContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  background: `
    linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
    url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGZ1bHRlciBpZD0iYmx1ciI+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMwIi8+CjwvZmlsdGVyPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N2VlYTtzdG9wLW9wYWNpdHk6MC44Ii8+CjxzdG9wIG9mZnNldD0iMjUlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjA5M2ZiO3N0b3Atb3BhY2l0eTowLjciLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWQ2ZTM7c3RvcC1vcGFjaXR5OjAuNiIvPgo8c3RvcCBvZmZzZXQ9Ijc1JSIgc3R5bGU9InN0b3AtY29sb3I6I2E4ZWRlYTtzdG9wLW9wYWNpdHk6MC43Ii8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izc2NGJhMjtzdG9wLW9wYWNpdHk6MC44Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgZmlsdGVyPSJ1cmwoI2JsdXIpIi8+CjxjaXJjbGUgY3g9IjE2MDAiIGN5PSIzMDAiIHI9IjIwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgZmlsdGVyPSJ1cmwoI2JsdXIpIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjcwMCIgcj0iMTgwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDkpIiBmaWx0ZXI9InVybCgjYmx1cikiLz4KPGNpcmNsZSBjeD0iMTQwMCIgY3k9IjgwMCIgcj0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBmaWx0ZXI9InVybCgjYmx1cikiLz4KPGNpcmNsZSBjeD0iODAwIiBjeT0iNDAwIiByPSIxNjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiIGZpbHRlcj0idXJsKCNibHVyKSIvPgo8L3N2Zz4K')
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
  fontFamily: '"Roboto", sans-serif',
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  animation: `${fadeIn} 0.6s ease-out`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const MemoryCard = styled('button')(({ theme, isFlipped, isMatched }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '16px',
  border: 'none',
  fontSize: '2rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: isFlipped 
    ? (isMatched 
      ? 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  color: isFlipped ? 'white' : '#667eea',
  fontWeight: 'bold',
  animation: isMatched ? `${pulse} 0.6s ease-in-out` : 'none',
  '&:hover:not(:disabled)': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  '&:disabled': {
    cursor: 'default',
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  textAlign: 'center',
  animation: `${float} 3s ease-in-out infinite`,
}));

const BreathingCircle = styled('div')(({ theme, isBreathing, phase }) => ({
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: phase === 'inhale' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : phase === 'exhale'
    ? 'linear-gradient(135deg, #ff6b9d 0%, #ffa69e 100%)'
    : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  transition: 'all 0.3s ease',
  transform: isBreathing 
    ? (phase === 'inhale' ? 'scale(1.3)' : phase === 'exhale' ? 'scale(0.8)' : 'scale(1)')
    : 'scale(1)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  border: '3px solid rgba(255, 255, 255, 0.3)',
}));

const Game = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Memory Game States
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Breathing Game States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('ready'); // ready, inhale, hold, exhale
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [breathingTimer, setBreathingTimer] = useState(null);

  const symbols = ['🌸', '🌺', '🌻', '🌷', '🌹', '🦋', '🌿', '🍃'];

  const initializeGame = () => {
    const gameCards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameWon(false);
    setGameStarted(true);
  };

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedCards.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstCard, secondCard] = newFlippedCards;
      const firstSymbol = cards.find(card => card.id === firstCard).symbol;
      const secondSymbol = cards.find(card => card.id === secondCard).symbol;

      if (firstSymbol === secondSymbol) {
        setMatchedCards([...matchedCards, firstCard, secondCard]);
        setFlippedCards([]);
        
        if (matchedCards.length + 2 === cards.length) {
          setGameWon(true);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isCardFlipped = (cardId) => {
    return flippedCards.includes(cardId) || matchedCards.includes(cardId);
  };

  const isCardMatched = (cardId) => {
    return matchedCards.includes(cardId);
  };

  const relaxationTips = [
    "Take deep breaths and focus on the present moment",
    "Gentle stretching can help relieve tension",
    "Listen to calming music or nature sounds",
    "Practice gratitude by thinking of three good things today",
    "Visualize your baby growing healthy and strong"
  ];

  const [currentTip, setCurrentTip] = useState(0);
  
  // Breathing Exercise Functions
  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingCycle(0);
    setBreathingPhase('inhale');
    
    const breathingSequence = () => {
      let phase = 'inhale';
      let cycleCount = 0;
      
      const timer = setInterval(() => {
        if (phase === 'inhale') {
          setBreathingPhase('hold');
          phase = 'hold';
        } else if (phase === 'hold') {
          setBreathingPhase('exhale');
          phase = 'exhale';
        } else if (phase === 'exhale') {
          cycleCount++;
          setBreathingCycle(cycleCount);
          if (cycleCount >= 10) {
            setBreathingActive(false);
            setBreathingPhase('ready');
            clearInterval(timer);
            return;
          }
          setBreathingPhase('inhale');
          phase = 'inhale';
        }
      }, 4000); // 4 seconds per phase
      
      setBreathingTimer(timer);
    };
    
    breathingSequence();
  };
  
  const stopBreathingExercise = () => {
    setBreathingActive(false);
    setBreathingPhase('ready');
    setBreathingCycle(0);
    if (breathingTimer) {
      clearInterval(breathingTimer);
      setBreathingTimer(null);
    }
  };

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % relaxationTips.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, [relaxationTips.length]);

  return (
    <>
      <SharedNavigation user={user} onLogout={onLogout} />
      <GameContainer>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Psychology sx={{ fontSize: 40, color: '#667eea', mr: 2 }} />
          <Typography variant="h3" sx={{ 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Stress Relief Center
          </Typography>
          <Spa sx={{ fontSize: 40, color: '#764ba2', ml: 2 }} />
        </Box>
        <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.7)', fontWeight: '400' }}>
          Choose your relaxation journey - mindful games and breathing exercises ✨
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
          sx={{
            '& .MuiTab-root': {
              borderRadius: '20px 20px 0 0',
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '1rem'
            }
          }}
        >
          <Tab 
            icon={<Psychology />} 
            label="Memory Game" 
            sx={{ color: '#667eea' }}
          />
          <Tab 
            icon={<Air />} 
            label="Breathing Exercise" 
            sx={{ color: '#764ba2' }}
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          {!gameStarted ? (
            <GlassCard sx={{ mb: 4, textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <FavoriteRounded sx={{ fontSize: 60, color: '#ff6b9d', mb: 2 }} />
                  <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    Ready for Some Relaxation?
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(0,0,0,0.7)', 
                    lineHeight: 1.8,
                    maxWidth: '500px',
                    mx: 'auto'
                  }}>
                    This beautiful memory game is specially designed to help you unwind and focus your mind. 
                    Take your time, breathe deeply, and enjoy this peaceful moment for yourself.
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  onClick={initializeGame}
                  size="large"
                  sx={{
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  🎮 Start Your Relaxing Game
                </Button>
              </CardContent>
            </GlassCard>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <StatsCard elevation={0}>
                    <Typography variant="h4" sx={{ fontWeight: '700', color: '#667eea' }}>
                      {moves}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                      Moves
                    </Typography>
                  </StatsCard>
                  <StatsCard elevation={0}>
                    <Typography variant="h4" sx={{ fontWeight: '700', color: '#764ba2' }}>
                      {matchedCards.length / 2}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                      Pairs Found
                    </Typography>
                  </StatsCard>
                </Box>
                <Button 
                  variant="contained"
                  onClick={initializeGame}
                  startIcon={<Refresh />}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #ffa69e 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ff5a8a 0%, #ff9688 100%)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  New Game
                </Button>
              </Box>

              {gameWon && (
                <GlassCard sx={{ mb: 3, textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <EmojiEvents sx={{ fontSize: 50, color: '#FFD700', mb: 2 }} />
                    <Typography variant="h5" sx={{ 
                      fontWeight: '700', 
                      color: '#2d3748',
                      mb: 1
                    }}>
                      🎉 Wonderful! You Did It! 🎉
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                      You completed the game in <Chip label={`${moves} moves`} sx={{ 
                        background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                        color: 'white',
                        fontWeight: '600'
                      }} />!
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'rgba(0,0,0,0.6)' }}>
                      Take a moment to appreciate this accomplishment and the calm focus you achieved ✨
                    </Typography>
                  </CardContent>
                </GlassCard>
              )}

              <GlassCard sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: 2,
                    maxWidth: '400px',
                    mx: 'auto'
                  }}>
                    {cards.map((card) => (
                      <MemoryCard
                        key={card.id}
                        isFlipped={isCardFlipped(card.id)}
                        isMatched={isCardMatched(card.id)}
                        onClick={() => handleCardClick(card.id)}
                        disabled={isCardFlipped(card.id)}
                      >
                        {isCardFlipped(card.id) ? card.symbol : '✨'}
                      </MemoryCard>
                    ))}
                  </Box>
                </CardContent>
              </GlassCard>
            </>
          )}
        </>
      )}
      
      {activeTab === 1 && (
        <>
          <GlassCard sx={{ mb: 4, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Air sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  Guided Breathing Exercise
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(0,0,0,0.7)', 
                  lineHeight: 1.8,
                  maxWidth: '500px',
                  mx: 'auto',
                  mb: 3
                }}>
                  Follow the breathing circle for a calming 4-4-4 breathing pattern. 
                  Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds.
                </Typography>
              </Box>
              
              <BreathingCircle 
                isBreathing={breathingActive}
                phase={breathingPhase}
              >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                    {breathingPhase === 'inhale' ? 'Breathe In' : 
                     breathingPhase === 'hold' ? 'Hold' :
                     breathingPhase === 'exhale' ? 'Breathe Out' : 'Ready'}
                  </Typography>
                  {breathingActive && (
                    <Typography variant="h6">
                      Cycle {breathingCycle}/10
                    </Typography>
                  )}
                </Box>
              </BreathingCircle>
              
              <Box sx={{ mt: 4 }}>
                {!breathingActive ? (
                  <Button 
                    variant="contained" 
                    onClick={startBreathingExercise}
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      borderRadius: '25px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    🫁 Start Breathing Exercise
                  </Button>
                ) : (
                  <Button 
                    variant="outlined"
                    onClick={stopBreathingExercise}
                    size="large"
                    startIcon={<Pause />}
                    sx={{
                      borderRadius: '25px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      borderColor: '#ff6b9d',
                      color: '#ff6b9d',
                      '&:hover': {
                        borderColor: '#ff5a8a',
                        color: '#ff5a8a',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Stop Exercise
                  </Button>
                )}
              </Box>
              
              {breathingCycle >= 10 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: '600' }}>
                    🌟 Excellent! You've completed the breathing exercise!
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)', mt: 1 }}>
                    Take a moment to notice how you feel. Your mind and body are now more relaxed.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </GlassCard>
          
          <GlassCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: '600',
                color: '#2d3748',
                mb: 2,
                textAlign: 'center'
              }}>
                Benefits of Breathing Exercises During Pregnancy
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {[
                  { icon: '🫁', text: 'Increases oxygen flow to baby' },
                  { icon: '😌', text: 'Reduces anxiety and stress' },
                  { icon: '💤', text: 'Improves sleep quality' },
                  { icon: '🧘‍♀️', text: 'Prepares for labor breathing' }
                ].map((benefit, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '12px',
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <Typography sx={{ fontSize: '1.5rem', mr: 2 }}>
                      {benefit.icon}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2d3748', fontWeight: '500' }}>
                      {benefit.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </GlassCard>
        </>
      )}

      <GlassCard sx={{ mt: 4 }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Spa sx={{ fontSize: 28, color: '#667eea', mr: 1 }} />
            <Typography variant="h5" sx={{ 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Mindful Moment
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ 
            color: '#2d3748',
            fontWeight: '400',
            lineHeight: 1.6,
            fontStyle: 'italic'
          }}>
            "{relaxationTips[currentTip]}"
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(currentTip + 1) / relaxationTips.length * 100}
            sx={{ 
              mt: 2,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2
              }
            }}
          />
        </CardContent>
      </GlassCard>

      <GlassCard sx={{ mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Star sx={{ fontSize: 32, color: '#FFD700', mb: 1 }} />
            <Typography variant="h5" sx={{ 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Benefits of Mindful Gaming During Pregnancy
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {[
              { icon: '🧘‍♀️', text: 'Reduces stress and anxiety levels' },
              { icon: '🧠', text: 'Improves cognitive function and memory' },
              { icon: '💆‍♀️', text: 'Provides healthy distraction from discomfort' },
              { icon: '🌸', text: 'Promotes relaxation and mindfulness' },
              { icon: '😴', text: 'Can help improve sleep quality' }
            ].map((benefit, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 2,
                borderRadius: '12px',
                background: 'rgba(102, 126, 234, 0.05)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <Typography sx={{ fontSize: '1.5rem', mr: 2 }}>
                  {benefit.icon}
                </Typography>
                <Typography variant="body1" sx={{ color: '#2d3748', fontWeight: '500' }}>
                  {benefit.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </GlassCard>
    </GameContainer>
    </>
  );
};

export default Game;