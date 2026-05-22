const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');

// GET all applications for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE a new application
router.post('/', auth, async (req, res) => {
  const { company, role, status, jobUrl, notes } = req.body;
  try {
    const newApp = new Application({
      user: req.user.id,
      company,
      role,
      status,
      jobUrl,
      notes,
    });
    const application = await newApp.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// UPDATE an application
router.put('/:id', auth, async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    // Make sure user owns the application
    if (application.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE an application
router.delete('/:id', auth, async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    // Make sure user owns the application
    if (application.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    await Application.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Application removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;