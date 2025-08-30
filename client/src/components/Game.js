import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, Box, Alert } from '@mui/material';
import { Refresh, EmojiEvents } from '@mui/icons-material';

const Game = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

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

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % relaxationTips.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div className="game-container">
      <Typography variant="h4" gutterBottom className="text-dark">
        Stress Relief Memory Game 🧠
      </Typography>

      <Typography variant="body1" paragraph className="text-dark">
        Take a break and relax with this gentle memory game. Match the pairs to complete the game!
      </Typography>

      {!gameStarted ? (
        <Card sx={{ mb: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom className="text-dark">
              Ready to Play?
            </Typography>
            <Typography variant="body2" paragraph className="text-dark">
              This memory game is designed to help you relax and focus your mind. 
              Take your time and enjoy the process!
            </Typography>
            <Button 
              variant="contained" 
              onClick={initializeGame}
              className="submit-button"
              size="large"
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" className="text-dark">
              Moves: {moves}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={initializeGame}
              startIcon={<Refresh />}
            >
              New Game
            </Button>
          </Box>

          {gameWon && (
            <Alert 
              severity="success" 
              icon={<EmojiEvents />}
              sx={{ mb: 2 }}
            >
              Congratulations! You completed the game in {moves} moves! 🎉
            </Alert>
          )}

          <div className="memory-game">
            {cards.map((card) => (
              <button
                key={card.id}
                className={`memory-card ${isCardFlipped(card.id) ? 'flipped' : ''} ${isCardMatched(card.id) ? 'matched' : ''}`}
                onClick={() => handleCardClick(card.id)}
                disabled={isCardFlipped(card.id)}
              >
                {isCardFlipped(card.id) ? card.symbol : '?'}
              </button>
            ))}
          </div>
        </>
      )}

      <Card sx={{ mt: 3, backgroundColor: '#f0f8ff' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            💡 Relaxation Tip
          </Typography>
          <Typography variant="body1" className="text-dark">
            {relaxationTips[currentTip]}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            Benefits of Playing Games During Pregnancy
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" className="text-dark">
              Reduces stress and anxiety levels
            </Typography>
            <Typography component="li" variant="body2" className="text-dark">
              Improves cognitive function and memory
            </Typography>
            <Typography component="li" variant="body2" className="text-dark">
              Provides a healthy distraction from discomfort
            </Typography>
            <Typography component="li" variant="body2" className="text-dark">
              Promotes relaxation and mindfulness
            </Typography>
            <Typography component="li" variant="body2" className="text-dark">
              Can help improve sleep quality
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default Game;