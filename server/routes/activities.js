const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../utils/db');
const { auth } = require('../middleware/auth');

// GET /api/activities
router.get('/', auth, (req, res) => {
  const db = getDb();
  let activities = db.activities || [];

  if (req.user.role === 'employee') {
    activities = activities.filter(a => a.assignedTo === req.user.id);
  }

  activities.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  res.json(activities);
});

// POST /api/activities
router.post('/', auth, (req, res) => {
  const { title, type, dueDate, assignedTo, relatedTo, notes } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const db = getDb();
  let assignedUserId = assignedTo || req.user.id;
  let assignedUserName = req.user.name;

  if (assignedTo) {
    const assignedUser = (db.users || []).find(u => u.id === assignedTo);
    if (assignedUser) assignedUserName = `${assignedUser.name} (${assignedUser.role.toUpperCase()})`;
  }

  const newActivity = {
    id: uuidv4(),
    title: title.trim(),
    type: type || 'Task',
    dueDate: dueDate || new Date(Date.now() + 86400000).toISOString(),
    status: 'pending',
    assignedTo: assignedUserId,
    assignedName: assignedUserName,
    relatedTo: relatedTo || '',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.activities.unshift(newActivity);
  saveDb(db);

  res.status(201).json({ message: 'Activity created successfully', activity: newActivity });
});

// PUT /api/activities/:id
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.activities || []).findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  const activity = db.activities[index];
  const { title, type, dueDate, status, relatedTo, notes, assignedTo } = req.body;

  if (title !== undefined) activity.title = title.trim();
  if (type !== undefined) activity.type = type;
  if (dueDate !== undefined) activity.dueDate = dueDate;
  if (status !== undefined) activity.status = status;
  if (relatedTo !== undefined) activity.relatedTo = relatedTo;
  if (notes !== undefined) activity.notes = notes;

  if (assignedTo && assignedTo !== activity.assignedTo) {
    const assignedUser = (db.users || []).find(u => u.id === assignedTo);
    if (assignedUser) {
      activity.assignedTo = assignedTo;
      activity.assignedName = `${assignedUser.name} (${assignedUser.role.toUpperCase()})`;
    }
  }

  activity.updatedAt = new Date().toISOString();
  db.activities[index] = activity;
  saveDb(db);

  res.json({ message: 'Activity updated successfully', activity });
});

// DELETE /api/activities/:id
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.activities = (db.activities || []).filter(a => a.id !== id);
  saveDb(db);
  res.json({ message: 'Activity deleted successfully' });
});

module.exports = router;
