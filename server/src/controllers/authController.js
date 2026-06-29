import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

const sendAuth = (res, user) =>
  res.json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, theme: user.theme }
  });

export const register = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  sendAuth(res, user);
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const validPassword = user.password && password ? await bcrypt.compare(password, user.password) : false;
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  sendAuth(res, user);
});
