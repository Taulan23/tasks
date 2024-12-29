const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Получение задач с фильтрацией, поиском и сортировкой
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, sortBy, sortOrder = 'desc' } = req.query;
    
    // Базовый фильтр по пользователю
    let query = { user: req.user._id };
    
    // Поиск по тексту
    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }
    
    // Фильтр по статусу
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'active') {
      query.completed = false;
    }
    
    // Настройка сортировки
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const tasks = await Task.find(query)
      .sort(sort)
      .select('text completed createdAt updatedAt category priority dueDate isStarred');

    // Статистика
    const stats = {
      total: await Task.countDocuments({ user: req.user._id }),
      completed: await Task.countDocuments({ user: req.user._id, completed: true }),
      active: await Task.countDocuments({ user: req.user._id, completed: false })
    };

    res.json({
      tasks,
      stats
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание новой задачи
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      text: req.body.text,
      user: req.user._id,
      category: req.body.category || 'other',
      priority: req.body.priority || 'normal',
      completed: false,
      dueDate: req.body.dueDate || null
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании задачи',
      error: error.message 
    });
  }
});

// Обновление задачи
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Массовое обновление статуса задач
router.put('/bulk/status', auth, async (req, res) => {
  try {
    const { taskIds, completed } = req.body;
    
    const result = await Task.updateMany(
      { _id: { $in: taskIds }, user: req.user._id },
      { $set: { completed } }
    );

    res.json({ 
      message: 'Задачи обновлены',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление задачи
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }
    
    res.json({ message: 'Задача удалена' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Массовое удаление задач
router.delete('/bulk/delete', auth, async (req, res) => {
  try {
    const { taskIds } = req.body;
    
    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      user: req.user._id
    });

    res.json({ 
      message: 'Задачи удалены',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление подзадачи
router.post('/:id/subtasks', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }
    
    task.subtasks.push({ text: req.body.text });
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление подзадачи
router.put('/:id/subtasks/:subtaskId', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Подзадача не найдена' });
    }

    subtask.text = req.body.text || subtask.text;
    subtask.completed = req.body.completed ?? subtask.completed;
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление тегов
router.post('/:id/tags', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    task.tags = [...new Set([...task.tags, ...req.body.tags])];
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отметить задачу как избранную
router.put('/:id/star', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    task.isStarred = !task.isStarred;
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Архивация задачи
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    task.isArchived = !task.isArchived;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение статистики по категориям
router.get('/stats/categories', auth, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user._id)
        } 
      },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } }
        }
      },
      { 
        $project: {
          category: '$_id',
          count: 1,
          completed: 1,
          progress: {
            $multiply: [{ $divide: ['$completed', '$count'] }, 100]
          }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    console.error('Error getting category stats:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение задач с дедлайном на сегодня
router.get('/due-today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ priority: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Массовое обновление категории
router.put('/bulk/category', auth, async (req, res) => {
  try {
    const { taskIds, category } = req.body;
    const result = await Task.updateMany(
      { _id: { $in: taskIds }, user: req.user._id },
      { $set: { category } }
    );
    res.json({ 
      message: 'Категории обновлены',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 