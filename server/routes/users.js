const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../utils/db');
const { auth, requireAdminOrHR } = require('../middleware/auth');

// GET /api/users - List users
router.get('/', auth, (req, res) => {
  const db = getDb();
  // Return users with passwords omitted
  const users = (db.users || []).map(u => {
    const { password, ...safeUser } = u;
    return safeUser;
  });
  res.json(users);
});

// POST /api/users - Create a new user (Admin can create HR or Employee; HR can only create Employee)
router.post('/', auth, requireAdminOrHR, (req, res) => {
  const { name, email, password, role, title, department, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  const normalizedRole = role.toLowerCase();

  // Role creation permission checks
  if (req.user.role === 'hr') {
    if (normalizedRole !== 'employee') {
      return res.status(403).json({
        message: 'Permission denied: HR accounts can only create Employee / Sales Person accounts.'
      });
    }
  } else if (req.user.role === 'admin') {
    if (!['hr', 'employee', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role. Allowed roles: admin, hr, employee' });
    }
  }

  const db = getDb();
  const existing = (db.users || []).find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ message: 'A user with this email already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    role: normalizedRole,
    department: department || (normalizedRole === 'hr' ? 'Human Resources' : 'Sales & Operations'),
    title: title || (normalizedRole === 'hr' ? 'HR Specialist' : 'Sales Executive'),
    phone: phone || '',
    status: 'active',
    createdBy: req.user.id,
    createdByName: req.user.name,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    message: `${normalizedRole.toUpperCase()} account created successfully`,
    user: safeUser
  });
});

// PUT /api/users/:id - Update user
router.put('/:id', auth, requireAdminOrHR, (req, res) => {
  const { id } = req.params;
  const { name, email, role, title, department, phone, status, password } = req.body;

  const db = getDb();
  const index = (db.users || []).findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const targetUser = db.users[index];

  // HR can only edit Employee accounts, never Admin or other HRs
  if (req.user.role === 'hr') {
    if (targetUser.role !== 'employee' && targetUser.id !== req.user.id) {
      return res.status(403).json({
        message: 'Permission denied: HR can only update Employee accounts.'
      });
    }
    // HR cannot change someone to 'admin' or 'hr'
    if (role && role !== 'employee' && targetUser.id !== req.user.id) {
      return res.status(403).json({
        message: 'Permission denied: HR cannot promote accounts to Admin or HR.'
      });
    }
  }

  // Update fields
  if (name) targetUser.name = name.trim();
  if (email) targetUser.email = email.trim().toLowerCase();
  if (title !== undefined) targetUser.title = title;
  if (department !== undefined) targetUser.department = department;
  if (phone !== undefined) targetUser.phone = phone;
  if (status) targetUser.status = status;
  if (role && req.user.role === 'admin') targetUser.role = role.toLowerCase();
  if (password && password.trim()) {
    targetUser.password = bcrypt.hashSync(password, 10);
  }

  targetUser.updatedAt = new Date().toISOString();
  db.users[index] = targetUser;
  saveDb(db);

  const { password: _, ...safeUser } = targetUser;
  res.json({
    message: 'User updated successfully',
    user: safeUser
  });
});

// DELETE /api/users/:id - Delete or deactivate user
router.delete('/:id', auth, requireAdminOrHR, (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  const db = getDb();
  const targetUser = (db.users || []).find(u => u.id === id);

  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.user.role === 'hr' && targetUser.role !== 'employee') {
    return res.status(403).json({
      message: 'Permission denied: HR can only remove Employee accounts.'
    });
  }

  db.users = db.users.filter(u => u.id !== id);
  saveDb(db);

  res.json({ message: 'User removed successfully' });
});

// POST /api/users/:id/reset-password - Quick password reset by Admin or HR
router.post('/:id/reset-password', auth, requireAdminOrHR, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const db = getDb();
  const targetUser = (db.users || []).find(u => u.id === id);

  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.user.role === 'hr' && targetUser.role !== 'employee') {
    return res.status(403).json({
      message: 'Permission denied: HR can only reset passwords for Employees.'
    });
  }

  targetUser.password = bcrypt.hashSync(newPassword, 10);
  saveDb(db);

  res.json({ message: `Password reset successfully for ${targetUser.name}` });
});

module.exports = router;
