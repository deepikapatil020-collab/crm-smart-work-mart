const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../utils/db');
const { auth, requireAdminOrHR } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function parseUploadedFile(file) {
  const workbook = xlsx.read(file.buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
}

// ------------------------------------------
// 1. IMPORT ROUTER
// ------------------------------------------
const importRouter = express.Router();

importRouter.post('/leads', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const rows = parseUploadedFile(req.file);
    if (!rows || rows.length === 0) return res.status(400).json({ message: 'File is empty' });

    const db = getDb();
    let importedCount = 0;
    const errors = [];

    rows.forEach((row, idx) => {
      const name = row['Name'] || row['name'] || row['Full Name'] || row['Contact Name'] || '';
      const company = row['Company'] || row['company'] || row['Organization'] || row['Company Name'] || '';
      const email = row['Email'] || row['email'] || '';
      const phone = row['Phone'] || row['phone'] || '';
      const value = parseFloat(row['Value'] || row['value'] || row['Amount'] || 0) || 0;
      const stage = row['Stage'] || row['stage'] || 'New';
      const source = row['Source'] || row['source'] || 'Import';
      const priority = (row['Priority'] || row['priority'] || 'medium').toLowerCase();
      const notes = row['Notes'] || row['notes'] || '';

      if (!name && !company) {
        errors.push(`Row ${idx + 2}: Missing both Name and Company`);
        return;
      }

      const newLead = {
        id: uuidv4(),
        name: String(name).trim(),
        company: String(company).trim() || 'Direct Customer',
        email: String(email).trim(),
        phone: String(phone).trim(),
        value,
        stage: String(stage).trim(),
        source: String(source).trim(),
        priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
        assignedTo: req.user.id,
        assignedName: `${req.user.name} (${req.user.role.toUpperCase()})`,
        createdBy: req.user.id,
        createdByName: req.user.name,
        notes: String(notes).trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.leads.unshift(newLead);
      importedCount++;
    });

    saveDb(db);
    res.json({
      message: `Successfully imported ${importedCount} leads!`,
      importedCount,
      errors: errors.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing file: ' + err.message });
  }
});

importRouter.post('/customers', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const rows = parseUploadedFile(req.file);
    if (!rows || rows.length === 0) return res.status(400).json({ message: 'File is empty' });

    const db = getDb();
    let importedCount = 0;

    rows.forEach(row => {
      const name = row['Company'] || row['Name'] || row['Customer Name'] || row['company'] || '';
      const contactPerson = row['Contact Person'] || row['Contact'] || row['contactPerson'] || '';
      const email = row['Email'] || row['email'] || '';
      const phone = row['Phone'] || row['phone'] || '';
      const address = row['Address'] || row['address'] || '';
      const totalSpent = parseFloat(row['Total Spent'] || row['totalSpent'] || 0) || 0;

      if (!name) return;

      const customer = {
        id: uuidv4(),
        name: String(name).trim(),
        contactPerson: String(contactPerson).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        totalSpent,
        status: 'active',
        dealsCount: 0,
        accountOwner: req.user.name,
        ownerId: req.user.id,
        createdAt: new Date().toISOString()
      };

      db.customers.unshift(customer);
      importedCount++;
    });

    saveDb(db);
    res.json({ message: `Successfully imported ${importedCount} customers!`, importedCount });
  } catch (err) {
    res.status(500).json({ message: 'Error processing file: ' + err.message });
  }
});

importRouter.post('/deals', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const rows = parseUploadedFile(req.file);
    if (!rows || rows.length === 0) return res.status(400).json({ message: 'File is empty' });

    const db = getDb();
    let importedCount = 0;

    rows.forEach(row => {
      const title = row['Deal Title'] || row['Title'] || row['title'] || '';
      const customerName = row['Customer'] || row['Customer Name'] || row['customerName'] || '';
      const amount = parseFloat(row['Amount'] || row['amount'] || row['Value'] || 0) || 0;
      const stage = row['Stage'] || row['stage'] || 'Discovery';
      const expectedCloseDate = row['Close Date'] || row['expectedCloseDate'] || new Date().toISOString().split('T')[0];

      if (!title || !customerName) return;

      const deal = {
        id: uuidv4(),
        title: String(title).trim(),
        customerName: String(customerName).trim(),
        contactEmail: String(row['Email'] || '').trim(),
        amount,
        stage: String(stage).trim(),
        probability: stage === 'Closed Won' ? 100 : 50,
        expectedCloseDate: String(expectedCloseDate).trim(),
        assignedTo: req.user.id,
        assignedName: `${req.user.name} (${req.user.role.toUpperCase()})`,
        createdBy: req.user.id,
        createdAt: new Date().toISOString()
      };

      db.deals.unshift(deal);
      importedCount++;
    });

    saveDb(db);
    res.json({ message: `Successfully imported ${importedCount} deals!`, importedCount });
  } catch (err) {
    res.status(500).json({ message: 'Error processing file: ' + err.message });
  }
});

importRouter.post('/users', auth, requireAdminOrHR, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const rows = parseUploadedFile(req.file);
    if (!rows || rows.length === 0) return res.status(400).json({ message: 'File is empty' });

    const db = getDb();
    let importedCount = 0;
    const errors = [];

    rows.forEach((row, idx) => {
      const name = row['Name'] || row['Full Name'] || row['name'] || '';
      const email = row['Email'] || row['email'] || '';
      const password = row['Password'] || row['password'] || 'SmartWork@2026';
      let role = (row['Role'] || row['role'] || 'employee').toLowerCase();
      const department = row['Department'] || row['department'] || 'Sales';
      const title = row['Title'] || row['title'] || 'Sales Representative';
      const phone = row['Phone'] || row['phone'] || '';

      if (!name || !email) {
        errors.push(`Row ${idx + 2}: Missing name or email`);
        return;
      }

      if (req.user.role === 'hr' && role !== 'employee') {
        role = 'employee';
      }

      const exists = (db.users || []).find(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
      if (exists) {
        errors.push(`Row ${idx + 2}: Email ${email} already exists`);
        return;
      }

      const newUser = {
        id: uuidv4(),
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password: bcrypt.hashSync(String(password).trim(), 10),
        role,
        department: String(department).trim(),
        title: String(title).trim(),
        phone: String(phone).trim(),
        status: 'active',
        createdBy: req.user.id,
        createdByName: req.user.name,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      importedCount++;
    });

    saveDb(db);
    res.json({
      message: `Successfully imported ${importedCount} users!`,
      importedCount,
      errors: errors.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing file: ' + err.message });
  }
});

// ------------------------------------------
// 2. EXPORT ROUTER
// ------------------------------------------
const exportRouter = express.Router();

exportRouter.get('/:type', auth, (req, res) => {
  const { type } = req.params;
  const format = (req.query.format || 'csv').toLowerCase();
  const db = getDb();

  let exportData = [];
  let fileName = `smart_work_mart_${type}_${Date.now()}`;

  switch (type) {
    case 'leads': {
      let leads = db.leads || [];
      if (req.user.role === 'employee') {
        leads = leads.filter(l => l.assignedTo === req.user.id || l.createdBy === req.user.id);
      }
      exportData = leads.map(l => ({
        'Lead ID': l.id,
        'Name': l.name,
        'Company': l.company,
        'Email': l.email,
        'Phone': l.phone,
        'Expected Value ($)': l.value,
        'Stage': l.stage,
        'Priority': l.priority,
        'Source': l.source,
        'Assigned To': l.assignedName,
        'Notes': l.notes,
        'Created Date': l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''
      }));
      break;
    }
    case 'deals': {
      let deals = db.deals || [];
      if (req.user.role === 'employee') {
        deals = deals.filter(d => d.assignedTo === req.user.id || d.createdBy === req.user.id);
      }
      exportData = deals.map(d => ({
        'Deal ID': d.id,
        'Deal Title': d.title,
        'Customer Name': d.customerName,
        'Contact Email': d.contactEmail,
        'Amount ($)': d.amount,
        'Stage': d.stage,
        'Probability (%)': d.probability,
        'Expected Close Date': d.expectedCloseDate,
        'Assigned To': d.assignedName,
        'Created Date': d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''
      }));
      break;
    }
    case 'customers': {
      exportData = (db.customers || []).map(c => ({
        'Customer ID': c.id,
        'Company Name': c.name,
        'Contact Person': c.contactPerson,
        'Email': c.email,
        'Phone': c.phone,
        'Address': c.address,
        'Total Spent ($)': c.totalSpent,
        'Status': c.status,
        'Deals Count': c.dealsCount,
        'Account Owner': c.accountOwner,
        'Created Date': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
      }));
      break;
    }
    case 'users': {
      if (req.user.role !== 'admin' && req.user.role !== 'hr') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      let users = db.users || [];
      if (req.user.role === 'hr') {
        users = users.filter(u => u.role === 'employee');
      }
      exportData = users.map(u => ({
        'User ID': u.id,
        'Full Name': u.name,
        'Email': u.email,
        'Role': u.role.toUpperCase(),
        'Title': u.title,
        'Department': u.department,
        'Phone': u.phone,
        'Status': u.status,
        'Joined Date': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''
      }));
      break;
    }
    default:
      return res.status(400).json({ message: 'Invalid export type' });
  }

  const worksheet = xlsx.utils.json_to_sheet(exportData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, type.toUpperCase());

  if (format === 'xlsx') {
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } else {
    const csvContent = xlsx.utils.sheet_to_csv(worksheet);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csvContent);
  }
});

// ------------------------------------------
// 3. TEMPLATE ROUTER (Public sample CSVs)
// ------------------------------------------
const templateRouter = express.Router();

templateRouter.get('/:type', (req, res) => {
  const { type } = req.params;
  let sampleData = [];

  if (type === 'leads') {
    sampleData = [
      {
        'Name': 'John Doe',
        'Company': 'Acme Corp',
        'Email': 'john@acme.com',
        'Phone': '+1 555-0100',
        'Value': 25000,
        'Stage': 'New',
        'Priority': 'high',
        'Source': 'Website Form',
        'Notes': 'Needs product catalog and bulk order quotation'
      },
      {
        'Name': 'Jane Smith',
        'Company': 'Global Solutions',
        'Email': 'jane@globalsol.com',
        'Phone': '+1 555-0101',
        'Value': 42000,
        'Stage': 'Qualified',
        'Priority': 'medium',
        'Source': 'LinkedIn',
        'Notes': 'Scheduled presentation next week'
      }
    ];
  } else if (type === 'customers') {
    sampleData = [
      {
        'Company': 'Apex Logistics Inc.',
        'Contact Person': 'Liam Vance',
        'Email': 'lvance@apexlogistics.com',
        'Phone': '+1 555-342-1100',
        'Address': '123 Market St, New York, NY',
        'Total Spent': 34000
      }
    ];
  } else if (type === 'deals') {
    sampleData = [
      {
        'Deal Title': 'Enterprise License Package',
        'Customer Name': 'Apex Logistics Inc.',
        'Email': 'lvance@apexlogistics.com',
        'Amount': 34000,
        'Stage': 'Negotiation',
        'Close Date': '2026-04-30'
      }
    ];
  } else if (type === 'users') {
    sampleData = [
      {
        'Name': 'Robert Vance',
        'Email': 'robert@smartworkmart.com',
        'Password': 'TempPassword123!',
        'Role': 'employee',
        'Department': 'Sales',
        'Title': 'Sales Associate',
        'Phone': '+1 555-0199'
      }
    ];
  } else {
    return res.status(400).json({ message: 'Unknown template type' });
  }

  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  const csvContent = xlsx.utils.sheet_to_csv(worksheet);

  res.setHeader('Content-Disposition', `attachment; filename="smart_work_mart_${type}_template.csv"`);
  res.setHeader('Content-Type', 'text/csv');
  res.send(csvContent);
});

module.exports = {
  importRouter,
  exportRouter,
  templateRouter
};
