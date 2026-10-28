const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('../utils/db');
const { generateToken, auth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = getDb();
  const user = (db.users || []).find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ message: 'Account is deactivated. Contact Admin.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user);
  const userSafe = { ...user };
  delete userSafe.password;

  res.json({
    message: 'Login successful',
    token,
    user: userSafe
  });
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  const db = getDb();
  const user = (db.users || []).find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const userSafe = { ...user };
  delete userSafe.password;
  res.json(userSafe);
});

// POST /api/auth/change-password
router.post('/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  const db = getDb();
  const userIndex = (db.users || []).findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = db.users[userIndex];
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  db.users[userIndex] = user;
  saveDb(db);

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
