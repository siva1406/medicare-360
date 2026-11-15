export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  // Mongoose duplicate key error (e.g. unique email or unique appointment slot)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    let message = 'Duplicate entry detected.';
    if (fields.includes('date') && fields.includes('slotTime')) {
      message = 'This time slot is already booked for this doctor. Please choose another time or date.';
    } else if (fields.includes('email')) {
      message = 'An account with this email address already exists.';
    } else {
      message = `Duplicate value for field: ${fields.join(', ')}`;
    }
    return res.status(409).json({
      success: false,
      message
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      errors: err.errors
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
