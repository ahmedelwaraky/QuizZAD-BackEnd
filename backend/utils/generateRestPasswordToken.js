import jwt from 'jsonwebtoken';

function generateResetPasswordToken(res, userId) {
  const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  res.cookie('jwt-reset', resetToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  return resetToken;
}

export default generateResetPasswordToken;
