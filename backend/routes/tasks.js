const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

// Get all tasks (with filters)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'Member') filter.assignedTo = req.user._id;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, description, status, priority, dueDate, project, assignedTo } = req.body;
  try {
    if (!title || !project) return res.status(400).json({ message: 'Title and project required' });
    const task = await Task.create({ title, description, status, priority, dueDate, project, assignedTo, createdBy: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status (Members can update their own tasks)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status of their assigned tasks
    if (req.user.role === 'Member') {
      if (task.assignedTo?.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized' });
      task.status = req.body.status || task.status;
    } else {
      Object.assign(task, req.body);
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dashboard stats
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'Member' ? { assignedTo: req.user._id } : {};
    const total = await Task.countDocuments(filter);
    const todo = await Task.countDocuments({ ...filter, status: 'Todo' });
    const inProgress = await Task.countDocuments({ ...filter, status: 'In Progress' });
    const done = await Task.countDocuments({ ...filter, status: 'Done' });
    const overdue = await Task.countDocuments({ ...filter, dueDate: { $lt: new Date() }, status: { $ne: 'Done' } });
    res.json({ total, todo, inProgress, done, overdue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
