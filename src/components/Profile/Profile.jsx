import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Box,
  Alert,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  PhotoCamera,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { portfolioService, taskService } from '../../services/api';
import './Profile.scss';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPortfolio();
    loadStats();
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await portfolioService.getPortfolio();
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await taskService.getTasks();
      setStats({
        total: response.data.stats.total || 0,
        completed: response.data.stats.completed || 0,
        active: response.data.stats.active || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddItem = async () => {
    if (!formData.title || !formData.description) {
      setError('Заполните название и описание');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.image) {
        data.append('image', formData.image);
      }

      await portfolioService.addPortfolioItem(data);
      await loadPortfolio();
      setOpenDialog(false);
      setFormData({ title: '', description: '', image: null });
      setError('');
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      setError(error.response?.data?.message || 'Ошибка при добавлении работы');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.image) {
        data.append('image', formData.image);
      }

      await portfolioService.updatePortfolioItem(selectedItem._id, data);
      loadPortfolio();
      setOpenDialog(false);
      setSelectedItem(null);
      setFormData({ title: '', description: '', image: null });
    } catch (error) {
      console.error('Error updating portfolio item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await portfolioService.deletePortfolioItem(id);
      setPortfolio(portfolio.filter(item => item._id !== id));
      setError('');
      setSuccess('Работа успешно удалена');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      setError(error.response?.data?.message || 'Ошибка при удалении работы');
    }
  };

  const handleChange = async (e) => {
    try {
      setLoading(true);
      await updateUser({
        [e.target.name]: e.target.value
      });
      setSuccess('Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="profile-container">
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ marginBottom: 2 }}
        >
          {error}
        </Alert>
      )}
      
      {/* Профиль пользователя */}
      <Paper elevation={3} className="profile-header">
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={user?.avatar}
              className="profile-avatar"
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4">{user?.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {user?.email}
            </Typography>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} className="stats-section">
          <Grid item xs={4}>
            <Paper className="stat-card">
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="subtitle2">Всего задач</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className="stat-card">
              <Typography variant="h4">{stats.completed}</Typography>
              <Typography variant="subtitle2">Выполнено</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className="stat-card">
              <Typography variant="h4">{stats.active}</Typography>
              <Typography variant="subtitle2">Активных</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Портфолио */}
      <Paper elevation={3} className="portfolio-section">
        <Box className="section-header">
          <Typography variant="h5">Портфолио</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedItem(null);
              setFormData({ title: '', description: '', image: null });
              setOpenDialog(true);
            }}
          >
            Добавить работу
          </Button>
        </Box>

        <Grid container spacing={3} className="portfolio-grid">
          {portfolio.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card className="portfolio-card">
                {item.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://localhost:3001${item.imageUrl}`}
                    alt={item.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    onClick={() => {
                      setSelectedItem(item);
                      setFormData({
                        title: item.title,
                        description: item.description,
                        image: null
                      });
                      setOpenDialog(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteItem(item._id)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Диалог добавления/редактирования */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedItem ? 'Редактировать работу' : 'Добавить работу'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Описание"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            fullWidth
            sx={{ mt: 2 }}
          >
            Загрузить фото
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            />
          </Button>
          {formData.image && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Выбран файл: {formData.image.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            onClick={selectedItem ? handleUpdateItem : handleAddItem}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (selectedItem ? 'Сохранить' : 'Добавить')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 