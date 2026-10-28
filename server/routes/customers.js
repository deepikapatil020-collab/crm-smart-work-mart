const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../utils/db');
const { auth } = require('../middleware/auth');

// GET /api/customers
router.get('/', auth, (req, res) => {
  const db = getDb();
  let customers = db.customers || [];
  const { search } = req.query;

  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter(
      c =>
        c.name?.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }

  customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(customers);
});

// POST /api/customers
router.post('/', auth, (req, res) => {
  const { name, contactPerson, email, phone, address, totalSpent, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Customer/Company name is required' });
  }

  const db = getDb();
  const newCustomer = {
    id: uuidv4(),
    name: name.trim(),
    contactPerson: contactPerson ? contactPerson.trim() : '',
    email: email ? email.trim() : '',
    phone: phone ? phone.trim() : '',
    address: address || '',
    totalSpent: parseFloat(totalSpent) || 0,
    status: status || 'active',
    dealsCount: 0,
    accountOwner: req.user.name,
    ownerId: req.user.id,
    createdAt: new Date().toISOString()
  };

  db.customers.unshift(newCustomer);
  saveDb(db);

  res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
});

// PUT /api/customers/:id
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.customers || []).findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const customer = db.customers[index];
  const { name, contactPerson, email, phone, address, totalSpent, status } = req.body;

  if (name !== undefined) customer.name = name.trim();
  if (contactPerson !== undefined) customer.contactPerson = contactPerson.trim();
  if (email !== undefined) customer.email = email.trim();
  if (phone !== undefined) customer.phone = phone.trim();
  if (address !== undefined) customer.address = address;
  if (totalSpent !== undefined) customer.totalSpent = parseFloat(totalSpent) || 0;
  if (status !== undefined) customer.status = status;

  customer.updatedAt = new Date().toISOString();
  db.customers[index] = customer;
  saveDb(db);

  res.json({ message: 'Customer updated successfully', customer });
});

// DELETE /api/customers/:id
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const customer = (db.customers || []).find(c => c.id === id);

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  db.customers = db.customers.filter(c => c.id !== id);
  saveDb(db);

  res.json({ message: 'Customer deleted successfully' });
});

module.exports = router;
