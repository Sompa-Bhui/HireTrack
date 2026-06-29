import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';

export const getMe = asyncHandler(async (req, res) => res.json(req.user));

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, theme } = req.body;
  req.user.name = name ?? req.user.name;
  req.user.avatar = avatar ?? req.user.avatar;
  req.user.theme = theme ?? req.user.theme;
  const user = await req.user.save();
  res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, theme: user.theme });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await req.user.constructor.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await req.user.deleteOne();
  res.json({ message: 'Account deleted' });
});
