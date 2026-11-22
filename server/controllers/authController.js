import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const send = (res, status, user) =>
  res.status(status).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!password || password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  // Admin accounts can never be self-created
  const safeRole = role === 'organizer' ? 'organizer' : 'user';
  const user = await User.create({ name, email, password, role: safeRole });
  send(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new HttpError(401, 'Incorrect email or password');
  send(res, 200, user);
});

export const me = asyncHandler(async (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ user: { id: _id, name, email, role } });
});
