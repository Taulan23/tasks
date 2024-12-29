import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
} from '@mui/material';
import { Delete, Add, Star, StarBorder } from '@mui/icons-material';
import './TaskDetails.scss';

const TaskDetails = ({ 
  task, 
  open, 
  onClose, 
  onSave, 
  onAddSubtask, 
  onToggleSubtask,
  onDeleteSubtask,
  onAddTag,
  onToggleStar 
}) => {
  const [newSubtask, setNewSubtask] = React.useState('');
  const [newTag, setNewTag] = React.useState('');

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(newSubtask);
      setNewSubtask('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag);
      setNewTag('');
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="dialog-title">
        <div className="title-content">
          <Typography variant="h6">Детали задачи</Typography>
          <IconButton onClick={() => onToggleStar(task._id)}>
            {task.isStarred ? <Star color="warning" /> : <StarBorder />}
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="task-form">
          <TextField
            fullWidth
            label="Название"
            value={task.text}
            onChange={(e) => onSave({ ...task, text: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={3}
            value={task.description || ''}
            onChange={(e) => onSave({ ...task, description: e.target.value })}
            margin="normal"
          />

          <div className="form-row">
            <FormControl fullWidth margin="normal">
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={task.priority}
                onChange={(e) => onSave({ ...task, priority: e.target.value })}
                label="Приоритет"
              >
                <MenuItem value="low">Низкий</MenuItem>
                <MenuItem value="normal">Средний</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
                <MenuItem value="urgent">Срочный</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Категория</InputLabel>
              <Select
                value={task.category}
                onChange={(e) => onSave({ ...task, category: e.target.value })}
                label="Категория"
              >
                <MenuItem value="personal">Личное</MenuItem>
                <MenuItem value="work">Работа</MenuItem>
                <MenuItem value="shopping">Покупки</MenuItem>
                <MenuItem value="health">Здоровье</MenuItem>
                <MenuItem value="other">Другое</MenuItem>
              </Select>
            </FormControl>
          </div>

          <TextField
            type="datetime-local"
            label="Срок выполнения"
            value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => onSave({ ...task, dueDate: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <div className="subtasks-section">
            <Typography variant="subtitle1" gutterBottom>
              Подзадачи
            </Typography>
            <div className="add-subtask">
              <TextField
                fullWidth
                size="small"
                placeholder="Новая подзадача"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
              />
              <IconButton onClick={handleAddSubtask}>
                <Add />
              </IconButton>
            </div>
            <List>
              {task.subtasks?.map((subtask, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => onDeleteSubtask(index)}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <Checkbox
                    edge="start"
                    checked={subtask.completed}
                    onChange={() => onToggleSubtask(index)}
                  />
                  <ListItemText primary={subtask.text} />
                </ListItem>
              ))}
            </List>
          </div>

          <div className="tags-section">
            <Typography variant="subtitle1" gutterBottom>
              Теги
            </Typography>
            <div className="add-tag">
              <TextField
                fullWidth
                size="small"
                placeholder="Новый тег"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <IconButton onClick={handleAddTag}>
                <Add />
              </IconButton>
            </div>
            <div className="tags-list">
              {task.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => {
                    const newTags = task.tags.filter((_, i) => i !== index);
                    onSave({ ...task, tags: newTags });
                  }}
                  className="tag-chip"
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button onClick={onClose} color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetails; 