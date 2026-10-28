const express = require('express');
const cors = require('cors');
const path = require('path');
const { seedDatabase } = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (usually port 5173 or 3000)
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auto-seed database with default users (Admin, HR, Sales), sample leads and deals
seedDatabase();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/activities', require('./routes/activities'));
// Import / Export / Template routes
const { importRouter, exportRouter, templateRouter } = require('./routes/importExport');
app.use('/api/import', importRouter);
app.use('/api/export', exportRouter);
app.use('/api/template', templateRouter);
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Smart Work Mart CRM',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if exists
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Smart Work Mart CRM Backend API is Running. Start frontend with npm run client.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Smart Work Mart CRM Server running on port ${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
