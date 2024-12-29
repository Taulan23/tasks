import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  TextField,
  Button,
  Checkbox,
  Chip,
  Tooltip,
  ListItemIcon,
} from '@mui/material';
import {
  Delete,
  Edit,
  Star,
  StarBorder,
  Flag,
  Schedule,
} from '@mui/icons-material';
import { taskService } from '../../services/api';
import TaskDetails from './TaskDetails';
import TaskStats from './TaskStats';
import TaskFilters from './TaskFilters';
import './TaskList.scss';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [categoryStats, setCategoryStats] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    tags: [],
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
    loadCategoryStats();
    loadTags();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskService.getTasks(filters);
      setTasks(response.data.tasks);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadCategoryStats = async () => {
    try {
      const response = await taskService.getCategoryStats();
      setCategoryStats(response.data);
    } catch (error) {
      console.error('Error loading category stats:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await taskService.getAllTags();
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const taskData = {
          text: newTask,
          category: 'other',
          priority: 'normal',
          completed: false
        };
        
        const response = await taskService.createTask(taskData);
        setTasks([response.data, ...tasks]);
        setNewTask('');
        loadCategoryStats();
        setError('');
      } catch (error) {
        console.error('Error adding task:', error);
        setError(error.response?.data?.message || 'Ошибка при добавлении задачи');
      }
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await taskService.updateTask(task._id, updatedTask);
      setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
      loadCategoryStats();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleToggleStar = async (task) => {
    try {
      await taskService.toggleStar(task._id);
      loadTasks();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
      loadCategoryStats();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#8bc34a',
      normal: '#ffc107',
      high: '#ff9800',
      urgent: '#f44336'
    };
    return colors[priority] || colors.normal;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', { 
      day: '2-digit',
      month: 'short'
    });
  };

  useEffect(() => {
    loadTasks();
  }, [filters]);

  return (
    <div className="task-list-container">
      <TaskStats stats={stats} categoryStats={categoryStats} />
      
      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
        availableTags={availableTags}
        categories={['personal', 'work', 'shopping', 'health', 'other']}
      />

      <Paper className="task-paper">
        <div className="task-input">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Новая задача"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTask}
          >
            Добавить
          </Button>
        </div>

        <List>
          {tasks.map((task) => (
            <ListItem
              key={task._id}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <ListItemIcon>
                <Checkbox
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  color="primary"
                />
              </ListItemIcon>
              
              <ListItemText
                primary={task.text}
                secondary={
                  <div className="task-details">
                    {task.category && (
                      <Chip
                        label={task.category}
                        size="small"
                        className={`category-chip ${task.category}`}
                      />
                    )}
                    {task.dueDate && (
                      <Tooltip title="Срок выполнения">
                        <Chip
                          icon={<Schedule />}
                          label={formatDate(task.dueDate)}
                          size="small"
                          className="due-date-chip"
                        />
                      </Tooltip>
                    )}
                    {task.priority && (
                      <Tooltip title="Приоритет">
                        <Chip
                          icon={<Flag />}
                          label={task.priority}
                          size="small"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        />
                      </Tooltip>
                    )}
                  </div>
                }
              />

              <div className="task-actions">
                <IconButton 
                  onClick={() => handleToggleStar(task)} 
                  className="star-button"
                  color={task.isStarred ? "warning" : "default"}
                >
                  {task.isStarred ? <Star /> : <StarBorder />}
                </IconButton>
                <IconButton onClick={() => {
                  setSelectedTask(task);
                  setOpenDialog(true);
                }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDeleteTask(task._id)}>
                  <Delete />
                </IconButton>
              </div>
            </ListItem>
          ))}
        </List>
      </Paper>

      <TaskDetails
        task={selectedTask}
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedTask(null);
          loadTasks();
          loadCategoryStats();
        }}
        onSave={async (updatedTask) => {
          try {
            await taskService.updateTask(updatedTask._id, updatedTask);
            setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
            loadCategoryStats();
          } catch (error) {
            console.error('Error updating task:', error);
          }
        }}
      />
    </div>
  );
};

export default TaskList; 