const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только изображения разрешены!'));
  }
});

// Получение профиля
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление профиля
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'settings'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Недопустимые поля для обновления' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Загрузка аватара
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    req.user.avatar = `/uploads/avatars/${req.file.filename}`;
    await req.user.save();
    res.json({ avatar: req.user.avatar });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Изменение пароля
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isMatch = await req.user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    req.user.password = newPassword;
    req.user.tokenVersion += 1;
    await req.user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Удаление аккаунта
router.delete('/account', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.json({ message: 'Аккаунт успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 