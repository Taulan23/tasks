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
import './Register.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    // Проверка на пустые поля
    if (!formData.name.trim()) {
      setError('Введите имя');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Введите email');
      return false;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email адрес');
      return false;
    }

    // Валидация пароля
    if (formData.password.length < 1) {
      setError('Введите пароль');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { name, email, password } = formData;
      await register({ name, email, password });
      navigate('/tasks');
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message || 
        'Ошибка при регистрации. Пожалуйста, попробуйте позже.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="register-container" maxWidth={false}>
      <Paper elevation={3} className="register-paper">
        <div className="register-header">
          <Typography variant="h4">Регистрация</Typography>
          <Typography variant="subtitle1">
            Создайте аккаунт для начала работы
          </Typography>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <TextField
            fullWidth
            label="Имя"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
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
          <TextField
            fullWidth
            label="Подтвердите пароль"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="login-link">
          <Typography variant="body2">
            Уже есть аккаунт?{' '}
            <Link component={RouterLink} to="/login">
              Войти
            </Link>
          </Typography>
        </div>
      </Paper>
    </Container>
  );
};

export default Register; 