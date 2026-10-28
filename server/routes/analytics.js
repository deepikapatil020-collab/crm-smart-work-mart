const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/db');
const { auth } = require('../middleware/auth');

// GET /api/analytics/dashboard
router.get('/dashboard', auth, (req, res) => {
  const db = getDb();
  let leads = db.leads || [];
  let deals = db.deals || [];
  let customers = db.customers || [];
  let users = db.users || [];

  // Filter for employee role
  const isEmployee = req.user.role === 'employee';
  if (isEmployee) {
    leads = leads.filter(l => l.assignedTo === req.user.id || l.createdBy === req.user.id);
    deals = deals.filter(d => d.assignedTo === req.user.id || d.createdBy === req.user.id);
  }

  // Key performance indicators
  const totalLeads = leads.length;
  const totalPipelineValue = leads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const wonRevenue = wonDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

  const closedDeals = deals.filter(d => ['Closed Won', 'Closed Lost'].includes(d.stage));
  const conversionRate = closedDeals.length > 0
    ? Math.round((wonDeals.length / closedDeals.length) * 100)
    : Math.round((leads.filter(l => l.stage === 'Won').length / Math.max(totalLeads, 1)) * 100);

  // Stage distribution
  const leadStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  const stageCounts = leadStages.map(stage => ({
    stage,
    count: leads.filter(l => l.stage.toLowerCase() === stage.toLowerCase()).length,
    value: leads
      .filter(l => l.stage.toLowerCase() === stage.toLowerCase())
      .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0)
  }));

  // Leaderboard / Rep breakdown (for Admin & HR)
  const reps = users.filter(u => ['employee', 'hr'].includes(u.role));
  const repPerformance = reps.map(rep => {
    const repLeads = (db.leads || []).filter(l => l.assignedTo === rep.id);
    const repDeals = (db.deals || []).filter(d => d.assignedTo === rep.id);
    const repWon = repDeals.filter(d => d.stage === 'Closed Won');
    const revenue = repWon.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

    return {
      id: rep.id,
      name: rep.name,
      role: rep.role,
      title: rep.title,
      department: rep.department,
      leadsCount: repLeads.length,
      dealsCount: repDeals.length,
      wonCount: repWon.length,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Source breakdown
  const sourceMap = {};
  leads.forEach(l => {
    const src = l.source || 'Other';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sources = Object.entries(sourceMap).map(([name, count]) => ({ name, count }));

  res.json({
    kpis: {
      totalLeads,
      totalPipelineValue,
      wonRevenue,
      conversionRate,
      activeCustomers: customers.length,
      activeDeals: deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length,
      teamMembers: users.length
    },
    stageCounts,
    repPerformance,
    sources,
    recentLeads: leads.slice(0, 5),
    recentDeals: deals.slice(0, 5)
  });
});

module.exports = router;
