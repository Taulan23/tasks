const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/portfolio';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

// Получение всех работ из портфолио
router.get('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('portfolio');
    res.json(user.portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении портфолио' });
  }
});

// Добавление новой работы в портфолио
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl = req.file ? `/uploads/portfolio/${req.file.filename}` : null;

    if (!req.user.portfolio) {
      req.user.portfolio = [];
    }

    const portfolioItem = {
      title,
      description,
      imageUrl,
      date: new Date()
    };

    req.user.portfolio.push(portfolioItem);
    await req.user.save();

    console.log('Portfolio item added:', portfolioItem); // для отладки

    res.status(201).json(portfolioItem);
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    res.status(500).json({ 
      message: 'Ошибка при добавлении работы',
      error: error.message 
    });
  }
});

// Обновление работы в портфолио
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const portfolioItem = req.user.portfolio.id(req.params.id);
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Работа не найдена' });
    }

    const { title, description } = req.body;
    if (title) portfolioItem.title = title;
    if (description) portfolioItem.description = description;
    if (req.file) {
      // Удаляем старое изображение
      if (portfolioItem.imageUrl) {
        const oldPath = path.join(__dirname, '..', 'public', portfolioItem.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      portfolioItem.imageUrl = `/uploads/portfolio/${req.file.filename}`;
    }

    await req.user.save();
    res.json(portfolioItem);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении работы' });
  }
});

// Удаление работы из портфолио
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Находим индекс элемента в массиве portfolio
    const portfolioItem = user.portfolio.id(req.params.id);
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Работа не найдена' });
    }

    // Удаляем файл изображения, если оно существует
    if (portfolioItem.imageUrl) {
      const imagePath = path.join(__dirname, '..', portfolioItem.imageUrl.replace('/uploads', 'uploads'));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Удаляем элемент из массива
    user.portfolio.pull(portfolioItem._id);
    await user.save();

    res.json({ message: 'Работа успешно удалена' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ 
      message: 'Ошибка при удалении работы',
      error: error.message 
    });
  }
});

module.exports = router; 