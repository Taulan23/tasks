import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  ExitToApp,
  Person,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.scss';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar position="static">
      <Toolbar className="navbar">
        <Typography variant="h6" component="div" className="title">
          Task Manager
        </Typography>
        
        {user ? (
          <div className="user-section">
            <Typography variant="body1" className="user-name">
              {user.name}
            </Typography>
            
            <IconButton
              onClick={handleMenu}
              color="inherit"
              className="user-menu-button"
            >
              <Avatar className="user-avatar">
                {getInitials(user.name)}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              className="user-menu"
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Профиль
              </MenuItem>
              
              <MenuItem onClick={() => {
                handleClose();
                navigate('/settings');
              }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Настройки
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={() => {
                handleClose();
                handleLogout();
              }}>
                <ListItemIcon>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                Выйти
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <div>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Войти
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Регистрация
            </Button>
          </div>
        )}
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 