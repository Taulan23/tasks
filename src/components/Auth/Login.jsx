import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.scss';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/tasks');
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container" maxWidth={false}>
      <Paper elevation={3} className="login-paper">
        <div className="login-header">
          <Typography variant="h4">Вход в систему</Typography>
          <Typography variant="subtitle1">
            Войдите для доступа к вашим задачам
          </Typography>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div className="register-link">
          <Typography variant="body2">
            Нет аккаунта?{' '}
            <Link component={RouterLink} to="/register">
              Зарегистрироваться
            </Link>
          </Typography>
        </div>
      </Paper>
    </Container>
  );
};

export default Login; 