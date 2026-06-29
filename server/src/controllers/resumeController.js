import asyncHandler from 'express-async-handler';
import Resume from '../models/Resume.js';

export const listResumes = asyncHandler(async (req, res) => {
  res.json(await Resume.find({ user: req.user._id }).sort('-createdAt'));
});

export const createResume = asyncHandler(async (req, res) => {
  const resume = await Resume.create({ ...req.body, user: req.user._id });
  res.status(201).json(resume);
});

export const deleteResume = asyncHandler(async (req, res) => {
  await Resume.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});
