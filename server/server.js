const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

// Устанавливаем strictQuery в false для mongoose
mongoose.set('strictQuery', false);

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3002', // URL вашего фронтенда
  credentials: true
}));
app.use(express.json());

// Создаем папки для загрузки, если их нет
const uploadDirs = ['uploads', 'uploads/portfolio'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Завершаем процесс при ошибке подключения
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/portfolio', require('./routes/portfolio'));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 