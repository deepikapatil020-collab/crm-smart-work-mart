const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../utils/db');
const { auth } = require('../middleware/auth');

// GET /api/leads - List all leads with role visibility & query filters
router.get('/', auth, (req, res) => {
  const db = getDb();
  let leads = db.leads || [];

  // If role is employee, they see leads assigned to them or created by them (or all if specified)
  const { assignedTo, stage, priority, search } = req.query;

  // If employee requests their own or filtered
  if (req.user.role === 'employee') {
    // Sales person sees their own assigned leads plus any they created
    leads = leads.filter(l => l.assignedTo === req.user.id || l.createdBy === req.user.id);
  } else if (assignedTo) {
    // Admin or HR can filter by specific sales rep
    leads = leads.filter(l => l.assignedTo === assignedTo);
  }

  if (stage && stage !== 'all') {
    leads = leads.filter(l => l.stage.toLowerCase() === stage.toLowerCase());
  }

  if (priority && priority !== 'all') {
    leads = leads.filter(l => l.priority?.toLowerCase() === priority.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(
      l =>
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q)
    );
  }

  // Sort by updatedAt or createdAt desc
  leads.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  res.json(leads);
});

// POST /api/leads - Create lead
router.post('/', auth, (req, res) => {
  const { name, company, email, phone, value, stage, source, priority, assignedTo, notes } = req.body;

  if (!name && !company) {
    return res.status(400).json({ message: 'Name or company name is required' });
  }

  const db = getDb();

  // Determine assigned user
  let assignedUserId = assignedTo;
  let assignedUserName = req.user.name;

  if (assignedUserId) {
    const assignedUser = (db.users || []).find(u => u.id === assignedUserId);
    if (assignedUser) {
      assignedUserName = `${assignedUser.name} (${assignedUser.role.toUpperCase()})`;
    }
  } else {
    // If not provided, default to current user (HR, Employee, or Admin)
    assignedUserId = req.user.id;
    assignedUserName = `${req.user.name} (${req.user.role.toUpperCase()})`;
  }

  const newLead = {
    id: uuidv4(),
    name: name ? name.trim() : '',
    company: company ? company.trim() : 'Independent Lead',
    email: email ? email.trim() : '',
    phone: phone ? phone.trim() : '',
    value: parseFloat(value) || 0,
    stage: stage || 'New',
    source: source || 'Direct',
    priority: priority || 'medium',
    assignedTo: assignedUserId,
    assignedName: assignedUserName,
    createdBy: req.user.id,
    createdByName: req.user.name,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.leads.unshift(newLead);
  saveDb(db);

  res.status(201).json({
    message: 'Lead created successfully',
    lead: newLead
  });
});

// PUT /api/leads/:id - Update lead
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.leads || []).findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  const lead = db.leads[index];

  // Employee can only update their own leads
  if (req.user.role === 'employee' && lead.assignedTo !== req.user.id && lead.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Permission denied: You can only edit your assigned leads' });
  }

  const { name, company, email, phone, value, stage, source, priority, assignedTo, notes } = req.body;

  if (name !== undefined) lead.name = name.trim();
  if (company !== undefined) lead.company = company.trim();
  if (email !== undefined) lead.email = email.trim();
  if (phone !== undefined) lead.phone = phone.trim();
  if (value !== undefined) lead.value = parseFloat(value) || 0;
  if (stage !== undefined) lead.stage = stage;
  if (source !== undefined) lead.source = source;
  if (priority !== undefined) lead.priority = priority;
  if (notes !== undefined) lead.notes = notes;

  if (assignedTo && assignedTo !== lead.assignedTo) {
    const assignedUser = (db.users || []).find(u => u.id === assignedTo);
    if (assignedUser) {
      lead.assignedTo = assignedTo;
      lead.assignedName = `${assignedUser.name} (${assignedUser.role.toUpperCase()})`;
    }
  }

  lead.updatedAt = new Date().toISOString();
  db.leads[index] = lead;
  saveDb(db);

  res.json({
    message: 'Lead updated successfully',
    lead
  });
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const lead = (db.leads || []).find(l => l.id === id);

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  if (req.user.role === 'employee' && lead.assignedTo !== req.user.id && lead.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Permission denied to delete this lead' });
  }

  db.leads = db.leads.filter(l => l.id !== id);
  saveDb(db);

  res.json({ message: 'Lead deleted successfully' });
});

// POST /api/leads/:id/convert - Convert lead to customer & deal
router.post('/:id/convert', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const lead = (db.leads || []).find(l => l.id === id);

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  // Update lead stage to 'Won'
  lead.stage = 'Won';
  lead.updatedAt = new Date().toISOString();

  // Create Customer if not exists
  let customer = (db.customers || []).find(
    c => (lead.email && c.email?.toLowerCase() === lead.email.toLowerCase()) ||
         (lead.company && c.name?.toLowerCase() === lead.company.toLowerCase())
  );

  if (!customer) {
    customer = {
      id: uuidv4(),
      name: lead.company || lead.name,
      contactPerson: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: '',
      totalSpent: lead.value || 0,
      status: 'active',
      dealsCount: 1,
      accountOwner: lead.assignedName,
      ownerId: lead.assignedTo,
      createdAt: new Date().toISOString()
    };
    db.customers.unshift(customer);
  } else {
    customer.dealsCount = (customer.dealsCount || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + (lead.value || 0);
  }

  // Create Deal
  const deal = {
    id: uuidv4(),
    title: `${lead.company || lead.name} - Converted Contract`,
    customerName: customer.name,
    contactEmail: lead.email,
    amount: lead.value || 10000,
    stage: 'Closed Won',
    probability: 100,
    expectedCloseDate: new Date().toISOString().split('T')[0],
    assignedTo: lead.assignedTo,
    assignedName: lead.assignedName,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  db.deals.unshift(deal);
  saveDb(db);

  res.json({
    message: 'Lead converted successfully to Customer and Won Deal!',
    lead,
    customer,
    deal
  });
});

module.exports = router;
