import React, { useState } from 'react';
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  Grid,
  Collapse,
  Button,
  Badge,
} from '@mui/material';
import {
  Search,
  Sort,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  Label,
} from '@mui/icons-material';
import './TaskFilters.scss';

const TaskFilters = ({ 
  filters, 
  onFilterChange,
  availableTags,
  categories 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return count;
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value && value !== 'all') return count + 1;
    return count;
  }, 0);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      tags: [],
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#4caf50',
      completed: '#2196f3',
      archived: '#9e9e9e'
    };
    return colors[status] || '#757575';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#8bc34a',
      normal: '#ffc107',
      high: '#ff9800',
      urgent: '#f44336'
    };
    return colors[priority] || '#757575';
  };

  return (
    <Paper className="task-filters" elevation={3}>
      <div className="filters-header">
        <div className="search-field">
          <Search className="search-icon" />
          <TextField
            fullWidth
            placeholder="Поиск задач..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            variant="outlined"
            size="small"
          />
          {filters.search && (
            <IconButton 
              size="small" 
              onClick={() => handleChange('search', '')}
              className="clear-button"
            >
              <Clear />
            </IconButton>
          )}
        </div>

        <div className="filters-actions">
          <Badge badgeContent={activeFiltersCount} color="primary">
            <Button
              startIcon={<FilterList />}
              endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowFilters(!showFilters)}
              color="primary"
              variant={activeFiltersCount > 0 ? "contained" : "outlined"}
              size="small"
            >
              Фильтры
            </Button>
          </Badge>

          {activeFiltersCount > 0 && (
            <Button
              size="small"
              onClick={clearFilters}
              className="clear-all"
            >
              Сбросить все
            </Button>
          )}
        </div>
      </div>

      <Collapse in={showFilters}>
        <div className="filters-content">
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="all">Все статусы</MenuItem>
                  {['active', 'completed', 'archived'].map(status => (
                    <MenuItem key={status} value={status}>
                      <div className="menu-item-with-color">
                        <span 
                          className="color-dot"
                          style={{ backgroundColor: getStatusColor(status) }}
                        />
                        {status === 'active' ? 'Активные' : 
                         status === 'completed' ? 'Выполненные' : 
                         'В архиве'}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Приоритет</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  label="Приоритет"
                >
                  <MenuItem value="all">Все приоритеты</MenuItem>
                  {['low', 'normal', 'high', 'urgent'].map(priority => (
                    <MenuItem key={priority} value={priority}>
                      <div className="menu-item-with-color">
                        <span 
                          className="color-dot"
                          style={{ backgroundColor: getPriorityColor(priority) }}
                        />
                        {priority === 'low' ? 'Низкий' :
                         priority === 'normal' ? 'Средний' :
                         priority === 'high' ? 'Высокий' :
                         'Срочный'}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Категория</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  label="Категория"
                >
                  <MenuItem value="all">Все категории</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      <div className="menu-item-with-icon">
                        <Label fontSize="small" />
                        {cat === 'personal' ? 'Личное' :
                         cat === 'work' ? 'Работа' :
                         cat === 'shopping' ? 'Покупки' :
                         cat === 'health' ? 'Здоровье' :
                         'Другое'}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Сортировка</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                  label="Сортировка"
                  startAdornment={<Sort className="sort-icon" />}
                >
                  <MenuItem value="createdAt">По дате создания</MenuItem>
                  <MenuItem value="dueDate">По сроку</MenuItem>
                  <MenuItem value="priority">По приоритету</MenuItem>
                  <MenuItem value="text">По названию</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {availableTags.length > 0 && (
            <div className="tags-section">
              <div className="tags-header">
                <Label fontSize="small" />
                <span>Теги</span>
              </div>
              <div className="tags-list">
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag];
                      handleChange('tags', newTags);
                    }}
                    color={filters.tags.includes(tag) ? "primary" : "default"}
                    size="small"
                    className="tag-chip"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Collapse>
    </Paper>
  );
};

export default TaskFilters; 