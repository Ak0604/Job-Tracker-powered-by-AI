process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

console.log('Step 1: starting');
const express = require('express');
console.log('Step 2: express loaded');
const mongoose = require('mongoose');
console.log('Step 3: mongoose loaded');
const cors = require('cors');
console.log('Step 4: cors loaded');
require('dotenv').config();
console.log('Step 5: dotenv loaded');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'defined' : 'MISSING');

const app = express();
app.use(cors());
app.use(express.json());

console.log('Step 6: loading routes');
app.use('/api/auth', require('./routes/auth'));
console.log('Step 7: auth route loaded');
app.use('/api/applications', require('./routes/applications'));
console.log('Step 8: applications route loaded');
app.use('/api/ai', require('./routes/ai'));
console.log('Step 9: ai route loaded');

app.get('/', (req, res) => res.json({ status: 'ok' }));

console.log('Step 10: connecting to MongoDB');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running on port', process.env.PORT || 5000);
    });
  })
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });