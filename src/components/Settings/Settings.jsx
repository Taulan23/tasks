import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Settings.scss';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSettingChange = async (setting, value) => {
    try {
      setLoading(true);
      await updateUser({
        settings: {
          ...user.settings,
          [setting]: value
        }
      });
      setSuccess('Настройки успешно обновлены');
      setError('');
    } catch (error) {
      console.error('Settings update error:', error);
      setError(error.response?.data?.message || 'Ошибка при обновлении настроек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" className="settings-container">
      <Paper elevation={3} className="settings-paper">
        <Typography variant="h5" gutterBottom>
          Настройки
        </Typography>

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              name="darkMode"
            />
          }
          label="Темная тема"
        />

        <FormControlLabel
          control={
            <Switch
              checked={user?.settings?.notifications ?? true}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              name="notifications"
              disabled={loading}
            />
          }
          label="Уведомления"
        />
      </Paper>
    </Container>
  );
};

export default Settings; 