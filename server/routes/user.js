const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PdfReader } = require('pdfreader');
const auth = require('../middleware/auth');
const User = require('../models/UserModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store PDF in memory (no disk writes needed — we only need the text)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// ---------------------------------------------------------------
// POST /api/user/resume
// Accepts a PDF, extracts text, optionally cleans it with Gemini,
// and saves it to the user's profile.
// ---------------------------------------------------------------
router.post('/resume', auth, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  try {
    // Step 1: Extract raw text from PDF buffer using pdfreader
    let resumeText = await new Promise((resolve, reject) => {
      const rows = [];
      new PdfReader().parseBuffer(req.file.buffer, (err, item) => {
        if (err) reject(err);
        else if (!item) resolve(rows.join(' '));
        else if (item.text) rows.push(item.text);
      });
    });

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract text from PDF. Make sure it is not a scanned image.' });
    }

    // Step 2: Clean up the text with Gemini (fix PDF extraction artifacts)
    try {
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash-001'];
      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `
The following is raw text extracted from a PDF resume. It may have garbled spacing, broken lines, or extraction artifacts.
Clean it up into well-structured plain text that preserves all the original information.
Do NOT add, remove, or change any facts. Just fix formatting and spacing.
Return ONLY the cleaned resume text, no explanation.

Raw text:
"""
${resumeText.slice(0, 5000)}
"""
`.trim();
          const result = await model.generateContent(prompt);
          resumeText = result.response.text();
          break;
        } catch (err) {
          console.log(`Model ${modelName} failed for resume clean, trying next...`);
        }
      }
    } catch (cleanErr) {
      // If Gemini cleaning fails, use raw extracted text — still functional
      console.log('Gemini cleaning skipped, using raw extracted text');
    }

    // Step 3: Save to user profile
    await User.findByIdAndUpdate(req.user.id, {
      resumeText: resumeText.trim(),
      resumeUpdatedAt: new Date(),
    });

    res.json({
      message: 'Resume uploaded and saved successfully',
      preview: resumeText.slice(0, 300) + '...',
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error('Resume upload error:', err.message);
    res.status(500).json({ error: 'Failed to process resume. Please try again.' });
  }
});

// ---------------------------------------------------------------
// GET /api/user/resume
// Returns the stored resume text and metadata for the logged-in user
// ---------------------------------------------------------------
router.get('/resume', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resumeText resumeUpdatedAt');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      hasResume: !!user.resumeText,
      resumeText: user.resumeText || '',
      updatedAt: user.resumeUpdatedAt || null,
    });
  } catch (err) {
    console.error('Get resume error:', err.message);
    res.status(500).json({ error: 'Could not fetch resume' });
  }
});

// ---------------------------------------------------------------
// DELETE /api/user/resume
// Clears the stored resume
// ---------------------------------------------------------------
router.delete('/resume', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      resumeText: '',
      resumeUpdatedAt: null,
    });
    res.json({ message: 'Resume removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove resume' });
  }
});

module.exports = router;