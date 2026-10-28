const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory cache for speed with disk sync
let data = {
  users: [],
  leads: [],
  deals: [],
  customers: [],
  activities: [],
  settings: {
    companyName: 'Smart Work Mart',
    tagline: 'YOUR SEARCH ENDS HERE',
    currency: 'USD',
    leadStages: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
    dealStages: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  }
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw.trim()) {
        data = JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error('Error reading db.json, using memory copy:', err.message);
  }
  return data;
}

function writeDb(newData) {
  if (newData) data = newData;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db.json:', err.message);
  }
}

// Initial load
readDb();

module.exports = {
  getDb: () => readDb(),
  saveDb: (newData) => writeDb(newData),
  getData: () => data,
  saveData: () => writeDb()
};
