const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// Get all projects (members see only their projects, admin sees all)
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'Admin'
      ? {}
      : { members: req.user._id };
    const projects = await Project.find(query).populate('createdBy', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, description, members } = req.body;
  try {
    if (!name) return res.status(400).json({ message: 'Project name required' });
    const project = await Project.create({ name, description, members: members || [], createdBy: req.user._id });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
