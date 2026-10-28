const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('./db');

function seedDatabase() {
  const db = getDb();

  // If already seeded with users, return
  if (db.users && db.users.length > 0) {
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  const adminId = uuidv4();
  const hrId = uuidv4();
  const emp1Id = uuidv4();
  const emp2Id = uuidv4();

  const users = [
    {
      id: adminId,
      name: 'Michael Scott (Admin)',
      email: 'admin@smartworkmart.com',
      password: defaultPasswordHash,
      role: 'admin',
      department: 'Executive Management',
      title: 'Chief Operating Officer',
      phone: '+1 (555) 901-2001',
      status: 'active',
      createdAt: new Date('2026-01-10T08:00:00Z').toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: hrId,
      name: 'Sarah Jenkins (HR)',
      email: 'hr@smartworkmart.com',
      password: defaultPasswordHash,
      role: 'hr',
      department: 'Human Resources & Sales Ops',
      title: 'HR Director & Senior Sales Lead',
      phone: '+1 (555) 901-2002',
      status: 'active',
      createdBy: adminId,
      createdAt: new Date('2026-01-15T09:30:00Z').toISOString(),
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: emp1Id,
      name: 'Alex Rivera (Sales)',
      email: 'alex@smartworkmart.com',
      password: defaultPasswordHash,
      role: 'employee',
      department: 'Corporate Sales',
      title: 'Senior Account Executive',
      phone: '+1 (555) 901-2003',
      status: 'active',
      createdBy: hrId,
      createdAt: new Date('2026-02-01T10:00:00Z').toISOString(),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: emp2Id,
      name: 'Emily Zhang (Sales)',
      email: 'emily@smartworkmart.com',
      password: defaultPasswordHash,
      role: 'employee',
      department: 'Enterprise Sales',
      title: 'Business Development Specialist',
      phone: '+1 (555) 901-2004',
      status: 'active',
      createdBy: adminId,
      createdAt: new Date('2026-02-15T11:00:00Z').toISOString(),
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const leads = [
    {
      id: uuidv4(),
      name: 'Liam Vance',
      company: 'Apex Logistics Inc.',
      email: 'lvance@apexlogistics.com',
      phone: '+1 (555) 342-1100',
      value: 34000,
      stage: 'Proposal Sent',
      source: 'Website Form',
      priority: 'high',
      assignedTo: emp1Id,
      assignedName: 'Alex Rivera (Sales)',
      createdBy: hrId,
      notes: 'Requested bulk equipment discount package for 4 regional offices.',
      createdAt: new Date('2026-03-01T14:20:00Z').toISOString(),
      updatedAt: new Date('2026-03-12T16:00:00Z').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Sophia Patel',
      company: 'NexTech Innovations',
      email: 'spatel@nextech.io',
      phone: '+1 (555) 887-2341',
      value: 58000,
      stage: 'Qualified',
      source: 'LinkedIn Outreach',
      priority: 'high',
      assignedTo: hrId,
      assignedName: 'Sarah Jenkins (HR)',
      createdBy: hrId,
      notes: 'Demo scheduled for next Tuesday. Key decision maker ready to review contract.',
      createdAt: new Date('2026-03-05T09:15:00Z').toISOString(),
      updatedAt: new Date('2026-03-14T11:30:00Z').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Marcus Brody',
      company: 'Greenfield Retail Group',
      email: 'mbrody@greenfield.org',
      phone: '+1 (555) 456-7890',
      value: 19500,
      stage: 'Contacted',
      source: 'Trade Show',
      priority: 'medium',
      assignedTo: emp2Id,
      assignedName: 'Emily Zhang (Sales)',
      createdBy: adminId,
      notes: 'Met at Expo 2026. Needs replenishment logistics and ERP integration.',
      createdAt: new Date('2026-03-08T11:45:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T15:00:00Z').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Elena Rostova',
      company: 'Vanguard Medical Supplies',
      email: 'elena@vanguardmed.com',
      phone: '+1 (555) 671-8899',
      value: 82000,
      stage: 'Won',
      source: 'Referral',
      priority: 'high',
      assignedTo: emp1Id,
      assignedName: 'Alex Rivera (Sales)',
      createdBy: emp1Id,
      notes: 'Contract signed for annual procurement supplies.',
      createdAt: new Date('2026-02-18T10:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-02T13:20:00Z').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Daniel Kim',
      company: 'BlueWave Digital',
      email: 'dkim@bluewavedigital.net',
      phone: '+1 (555) 912-3344',
      value: 12500,
      stage: 'New',
      source: 'Google Search',
      priority: 'medium',
      assignedTo: hrId,
      assignedName: 'Sarah Jenkins (HR)',
      createdBy: hrId,
      notes: 'Inbound inquiry received via contact form.',
      createdAt: new Date('2026-03-15T08:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-15T08:30:00Z').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Olivia Martinez',
      company: 'Summit Financial Partners',
      email: 'omartinez@summitfin.com',
      phone: '+1 (555) 789-2211',
      value: 27000,
      stage: 'Lost',
      source: 'Cold Call',
      priority: 'low',
      assignedTo: emp2Id,
      assignedName: 'Emily Zhang (Sales)',
      createdBy: adminId,
      notes: 'Competitor beat price by 8%. Keep on nurture list for Q4.',
      createdAt: new Date('2026-02-10T16:00:00Z').toISOString(),
      updatedAt: new Date('2026-02-28T17:00:00Z').toISOString()
    }
  ];

  const deals = [
    {
      id: uuidv4(),
      title: 'NexTech ERP Mart Integration',
      customerName: 'NexTech Innovations',
      contactEmail: 'spatel@nextech.io',
      amount: 58000,
      stage: 'Proposal',
      probability: 75,
      expectedCloseDate: '2026-04-15',
      assignedTo: hrId,
      assignedName: 'Sarah Jenkins (HR)',
      createdBy: hrId,
      createdAt: new Date('2026-03-06T10:00:00Z').toISOString()
    },
    {
      id: uuidv4(),
      title: 'Apex Logistics Hub Fulfillment',
      customerName: 'Apex Logistics Inc.',
      contactEmail: 'lvance@apexlogistics.com',
      amount: 34000,
      stage: 'Negotiation',
      probability: 85,
      expectedCloseDate: '2026-03-30',
      assignedTo: emp1Id,
      assignedName: 'Alex Rivera (Sales)',
      createdBy: emp1Id,
      createdAt: new Date('2026-03-02T12:00:00Z').toISOString()
    },
    {
      id: uuidv4(),
      title: 'Vanguard Annual Procurement Contract',
      customerName: 'Vanguard Medical Supplies',
      contactEmail: 'elena@vanguardmed.com',
      amount: 82000,
      stage: 'Closed Won',
      probability: 100,
      expectedCloseDate: '2026-03-02',
      assignedTo: emp1Id,
      assignedName: 'Alex Rivera (Sales)',
      createdBy: emp1Id,
      createdAt: new Date('2026-02-20T11:00:00Z').toISOString()
    },
    {
      id: uuidv4(),
      title: 'Greenfield Automated Replenishment',
      customerName: 'Greenfield Retail Group',
      contactEmail: 'mbrody@greenfield.org',
      amount: 19500,
      stage: 'Discovery',
      probability: 30,
      expectedCloseDate: '2026-05-01',
      assignedTo: emp2Id,
      assignedName: 'Emily Zhang (Sales)',
      createdBy: adminId,
      createdAt: new Date('2026-03-09T14:30:00Z').toISOString()
    }
  ];

  const customers = [
    {
      id: uuidv4(),
      name: 'Vanguard Medical Supplies',
      contactPerson: 'Elena Rostova',
      email: 'elena@vanguardmed.com',
      phone: '+1 (555) 671-8899',
      address: '742 Evergreen Terrace, Chicago, IL',
      totalSpent: 82000,
      status: 'active',
      dealsCount: 1,
      accountOwner: 'Alex Rivera (Sales)',
      ownerId: emp1Id,
      createdAt: new Date('2026-03-02T13:20:00Z').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Global Peak Technologies',
      contactPerson: 'Robert Hastings',
      email: 'rhastings@globalpeak.com',
      phone: '+1 (555) 432-8765',
      address: '100 Silicon Way, San Jose, CA',
      totalSpent: 145000,
      status: 'active',
      dealsCount: 3,
      accountOwner: 'Sarah Jenkins (HR)',
      ownerId: hrId,
      createdAt: new Date('2026-01-22T09:00:00Z').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Aura Cloud Services',
      contactPerson: 'Jessica Sterling',
      email: 'jster@auracloud.co',
      phone: '+1 (555) 321-9900',
      address: '55 5th Ave, New York, NY',
      totalSpent: 62000,
      status: 'active',
      dealsCount: 2,
      accountOwner: 'Emily Zhang (Sales)',
      ownerId: emp2Id,
      createdAt: new Date('2026-02-11T14:00:00Z').toISOString()
    }
  ];

  const activities = [
    {
      id: uuidv4(),
      title: 'Contract Terms Review with NexTech',
      type: 'Meeting',
      dueDate: '2026-03-28T14:00:00Z',
      status: 'pending',
      assignedTo: hrId,
      assignedName: 'Sarah Jenkins (HR)',
      relatedTo: 'NexTech Innovations',
      notes: 'Finalize SLA and payment schedule terms.'
    },
    {
      id: uuidv4(),
      title: 'Deliver Apex Logistics Proposal revisions',
      type: 'Task',
      dueDate: '2026-03-29T10:00:00Z',
      status: 'pending',
      assignedTo: emp1Id,
      assignedName: 'Alex Rivera (Sales)',
      relatedTo: 'Apex Logistics Inc.',
      notes: 'Update unit prices for 500+ volume.'
    },
    {
      id: uuidv4(),
      title: 'Follow-up Call with Greenfield Retail',
      type: 'Call',
      dueDate: '2026-03-30T15:30:00Z',
      status: 'pending',
      assignedTo: emp2Id,
      assignedName: 'Emily Zhang (Sales)',
      relatedTo: 'Greenfield Retail Group',
      notes: 'Gauge interest after technical deck review.'
    },
    {
      id: uuidv4(),
      title: 'Welcome onboarding call with Vanguard Med',
      type: 'Call',
      dueDate: '2026-03-05T11:00:00Z',
      status: 'completed',
      assignedTo: emp1Id,
      assignedName: 'Alex Rivera (Sales)',
      relatedTo: 'Vanguard Medical Supplies',
      notes: 'Onboarding completed smoothly.'
    }
  ];

  db.users = users;
  db.leads = leads;
  db.deals = deals;
  db.customers = customers;
  db.activities = activities;
  db.settings = {
    companyName: 'Smart Work Mart',
    tagline: 'YOUR SEARCH ENDS HERE',
    currency: 'USD',
    leadStages: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
    dealStages: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  };

  saveDb(db);
  console.log('Database successfully pre-seeded with Smart Work Mart CRM data.');
}

module.exports = { seedDatabase };
