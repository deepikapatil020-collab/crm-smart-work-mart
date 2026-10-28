const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../utils/db');
const { auth } = require('../middleware/auth');

// GET /api/deals
router.get('/', auth, (req, res) => {
  const db = getDb();
  let deals = db.deals || [];

  const { stage, assignedTo, search } = req.query;

  if (req.user.role === 'employee') {
    deals = deals.filter(d => d.assignedTo === req.user.id || d.createdBy === req.user.id);
  } else if (assignedTo) {
    deals = deals.filter(d => d.assignedTo === assignedTo);
  }

  if (stage && stage !== 'all') {
    deals = deals.filter(d => d.stage.toLowerCase() === stage.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    deals = deals.filter(
      d =>
        d.title?.toLowerCase().includes(q) ||
        d.customerName?.toLowerCase().includes(q) ||
        d.contactEmail?.toLowerCase().includes(q)
    );
  }

  deals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(deals);
});

// POST /api/deals
router.post('/', auth, (req, res) => {
  const { title, customerName, contactEmail, amount, stage, probability, expectedCloseDate, assignedTo } = req.body;

  if (!title || !customerName) {
    return res.status(400).json({ message: 'Deal title and customer name are required' });
  }

  const db = getDb();

  let assignedUserId = assignedTo;
  let assignedUserName = req.user.name;

  if (assignedUserId) {
    const assignedUser = (db.users || []).find(u => u.id === assignedUserId);
    if (assignedUser) {
      assignedUserName = `${assignedUser.name} (${assignedUser.role.toUpperCase()})`;
    }
  } else {
    assignedUserId = req.user.id;
    assignedUserName = `${req.user.name} (${req.user.role.toUpperCase()})`;
  }

  const newDeal = {
    id: uuidv4(),
    title: title.trim(),
    customerName: customerName.trim(),
    contactEmail: contactEmail ? contactEmail.trim() : '',
    amount: parseFloat(amount) || 0,
    stage: stage || 'Discovery',
    probability: parseInt(probability) || 50,
    expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
    assignedTo: assignedUserId,
    assignedName: assignedUserName,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  db.deals.unshift(newDeal);
  saveDb(db);

  res.status(201).json({ message: 'Deal created successfully', deal: newDeal });
});

// PUT /api/deals/:id
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.deals || []).findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Deal not found' });
  }

  const deal = db.deals[index];

  if (req.user.role === 'employee' && deal.assignedTo !== req.user.id && deal.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Permission denied: Cannot edit another user\'s deal' });
  }

  const { title, customerName, contactEmail, amount, stage, probability, expectedCloseDate, assignedTo } = req.body;

  if (title !== undefined) deal.title = title.trim();
  if (customerName !== undefined) deal.customerName = customerName.trim();
  if (contactEmail !== undefined) deal.contactEmail = contactEmail.trim();
  if (amount !== undefined) deal.amount = parseFloat(amount) || 0;
  if (stage !== undefined) deal.stage = stage;
  if (probability !== undefined) deal.probability = parseInt(probability) || 0;
  if (expectedCloseDate !== undefined) deal.expectedCloseDate = expectedCloseDate;

  if (assignedTo && assignedTo !== deal.assignedTo) {
    const assignedUser = (db.users || []).find(u => u.id === assignedTo);
    if (assignedUser) {
      deal.assignedTo = assignedTo;
      deal.assignedName = `${assignedUser.name} (${assignedUser.role.toUpperCase()})`;
    }
  }

  deal.updatedAt = new Date().toISOString();
  db.deals[index] = deal;
  saveDb(db);

  res.json({ message: 'Deal updated successfully', deal });
});

// DELETE /api/deals/:id
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const deal = (db.deals || []).find(d => d.id === id);

  if (!deal) {
    return res.status(404).json({ message: 'Deal not found' });
  }

  if (req.user.role === 'employee' && deal.assignedTo !== req.user.id && deal.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Permission denied to delete this deal' });
  }

  db.deals = db.deals.filter(d => d.id !== id);
  saveDb(db);

  res.json({ message: 'Deal deleted successfully' });
});

module.exports = router;
