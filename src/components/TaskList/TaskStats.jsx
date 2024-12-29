import React from 'react';
import {
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Star,
  Category
} from '@mui/icons-material';
import './TaskStats.scss';

const TaskStats = ({ stats, categoryStats }) => {
  return (
    <div className="stats-container">
      {/* Основная статистика */}
      <Grid container spacing={3} className="stats-grid">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card total">
            <CardContent>
              <Assignment className="icon" />
              <div className="stat-info">
                <Typography variant="h4">{stats.total || 0}</Typography>
                <Typography variant="subtitle2">Всего задач</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card completed">
            <CardContent>
              <CheckCircle className="icon" />
              <div className="stat-info">
                <Typography variant="h4">{stats.completed || 0}</Typography>
                <Typography variant="subtitle2">Выполнено</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card active">
            <CardContent>
              <Schedule className="icon" />
              <div className="stat-info">
                <Typography variant="h4">{stats.active || 0}</Typography>
                <Typography variant="subtitle2">Активных</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card starred">
            <CardContent>
              <Star className="icon" />
              <div className="stat-info">
                <Typography variant="h4">{stats.starred || 0}</Typography>
                <Typography variant="subtitle2">Важных</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Статистика по категориям */}
      <Paper className="category-stats">
        <Typography variant="h6" gutterBottom>
          <Category className="category-icon" /> Статистика по категориям
        </Typography>
        <Grid container spacing={2}>
          {categoryStats?.map((stat) => (
            <Grid item xs={12} sm={6} md={4} key={stat.category}>
              <div className="category-item">
                <div className="category-header">
                  <Typography variant="subtitle1">
                    {getCategoryLabel(stat.category)}
                  </Typography>
                  <Chip
                    label={`${stat.completed}/${stat.count}`}
                    size="small"
                    className="category-chip"
                  />
                </div>
                <LinearProgress
                  variant="determinate"
                  value={stat.progress}
                  className={`progress-${stat.category}`}
                />
              </div>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </div>
  );
};

const getCategoryLabel = (category) => {
  const labels = {
    personal: 'Личное',
    work: 'Работа',
    shopping: 'Покупки',
    health: 'Здоровье',
    other: 'Другое'
  };
  return labels[category] || category;
};

export default TaskStats; 