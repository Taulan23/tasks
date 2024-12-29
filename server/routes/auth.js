const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Валидация данных
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Все поля обязательны для заполнения' 
      });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Некорректный email адрес' 
      });
    }

    // Валидация пароля
    if (password.length < 1) {
      return res.status(400).json({ 
        message: 'Введите пароль' 
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Создаем нового пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Создаем токен
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Ошибка при регистрации',
      error: error.message 
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    // Создание токена
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление профиля пользователя
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Проверяем существование пользователя
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем, не занят ли email другим пользователем
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email уже используется' });
      }
    }

    // Обновляем данные
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    // Создаем новый токен
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении профиля',
      error: error.message 
    });
  }
});

// Обновление настроек пользователя
router.put('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Обновляем настройки
    user.settings = {
      ...user.settings,
      ...req.body.settings
    };

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      settings: user.settings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении настроек',
      error: error.message 
    });
  }
});

module.exports = router; 