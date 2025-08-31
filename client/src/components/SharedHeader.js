import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Avatar, Badge, IconButton, Box, Typography,
  Menu, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Notifications, Woman, Person, ExitToApp
} from '@mui/icons-material';
import { styled } from '@mui/system';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  color: theme.palette.text.primary,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.3)',
}));

const SharedHeader = ({ user, onLogout, notifications = [] }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.name) {
      setCurrentUser(storedUser);
    }
  }, [user]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
    setAvatarMenuAnchor(null);
  };

  return (
    <StyledAppBar position="static" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Woman sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ 
            fontWeight: '700',
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mom's Saathi
          </Typography>
        </Box>
        <IconButton color="inherit" sx={{ color: '#667eea' }}>
          <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
            <Notifications />
          </Badge>
        </IconButton>
        <Avatar 
          sx={{ ml: 2, bgcolor: '#667eea', width: 40, height: 40, cursor: 'pointer' }}
          src={currentUser.avatar}
          onClick={(e) => setAvatarMenuAnchor(e.currentTarget)}
        >
          {currentUser.name?.charAt(0) || 'U'}
        </Avatar>
        <Menu
          anchorEl={avatarMenuAnchor}
          open={Boolean(avatarMenuAnchor)}
          onClose={() => setAvatarMenuAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              mt: 1
            }
          }}
        >
          <MenuItem onClick={() => { navigate('/profile'); setAvatarMenuAnchor(null); }}>
            <Person sx={{ mr: 1, color: '#667eea' }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ExitToApp sx={{ mr: 1, color: '#ff4444' }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default SharedHeader;