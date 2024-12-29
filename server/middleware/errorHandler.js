module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Файл слишком большой'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Неверный тип файла'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Неверный формат ID'
    });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
}; 