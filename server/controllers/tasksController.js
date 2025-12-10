import mongoose from 'mongoose';
import Task from '../models/taskModel.js';
import { getIO } from '../socket.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const listTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate('creator', 'username email')
      .populate('lastMovedBy', 'username email')
      .lean();
    res.json(tasks);
  } catch (err) {
    console.error('listTasks error', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description = '', status = 'To Do' } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const task = await Task.create({
      title,
      description,
      status,
      creator: req.user.userId,
      lastMovedBy: req.user.userId,
      lastMovedAt: Date.now(),
    });
    const populated = await task.populate([
      { path: 'creator', select: 'username email' },
      { path: 'lastMovedBy', select: 'username email' },
    ]);
    try {
      getIO().emit('task:create', populated);
    } catch (e) {
      console.warn('Socket emit failed (create)', e.message);
    }
    res.status(201).json(populated);

  } catch (err) {
    console.error('createTask error', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid task id' });

    const updates = {};
    ['title', 'description', 'status'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isStatusOnly =
      Object.keys(updates).length === 1 && Object.prototype.hasOwnProperty.call(updates, 'status');

    // Permission:
    // - status-only changes: allow any authenticated user
    // - other edits: admin or owner
    if (!isStatusOnly && req.user.role !== 'admin' && task.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Track mover for status changes and apply updates
    if (updates.status && updates.status !== task.status) {
      task.status = updates.status;
      task.lastMovedBy = req.user.userId;
      task.lastMovedAt = Date.now();
    }
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;

    await task.save();

    const populated = await task.populate([
      { path: 'creator', select: 'username email' },
      { path: 'lastMovedBy', select: 'username email' },
    ]);
    try {
      getIO().emit('task:update', populated);
    } catch (e) {
      console.warn('Socket emit failed (update)', e.message);
    }
    res.json(populated);
  } catch (err) {
    console.error('updateTask error', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid task id' });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permission: admin can delete any; member only own
    if (req.user.role !== 'admin' && task.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await task.deleteOne();
    try {
      getIO().emit('task:delete', { _id: id });
    } catch (e) {
      console.warn('Socket emit failed (delete)', e.message);
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask error', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

