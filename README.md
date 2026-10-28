# Smart Work Mart CRM
> **"YOUR SEARCH ENDS HERE"** — Enterprise Multi-Role CRM System

![Smart Work Mart Logo](client/public/logo.png)

A full-featured, enterprise-grade Customer Relationship Management (CRM) system customized for **Smart Work Mart**. Built with **React 18**, **Tailwind CSS**, and **Node.js/Express**, featuring multi-tiered role authorization, lead pipeline tracking, deal management, customer records, activities, and bulk import/export in CSV and Excel (`.xlsx`) formats.

---

## 🌟 Key Capabilities & Role Permissions

### 1. Role-Based Access Control (RBAC)
| Capability | System Admin | HR Manager | Sales Representative / Employee |
| :--- | :---: | :---: | :---: |
| **Login & Access** | Full System Control | HR & Full Sales | Sales Pipeline |
| **Create HR Accounts** | ✅ Yes | ❌ No | ❌ No |
| **Create Employee Accounts** | ✅ Yes | ✅ Yes | ❌ No |
| **Manage Everyone's Data** | ✅ Yes (Company-wide) | ✅ Yes (Sales & HR) | 🔒 Assigned Leads/Deals |
| **Lead & Deal Pipeline** | ✅ Full Access | ✅ Full Access (Same as Sales) | ✅ Assigned / Created |
| **Customer Directory** | ✅ View & Edit All | ✅ View & Edit All | ✅ View All |
| **Import / Export Data** | ✅ Leads, Deals, Customers, Team | ✅ Leads, Deals, Customers, Employees | ✅ Leads, Deals |
| **Reset Passwords** | ✅ Any user | ✅ Employee accounts | ❌ No |

### 2. Full Sales Suite for HR & Sales Reps
As requested: **"HR should have all the things as a sales persons"**
- **Leads & Pipeline**: Interactive Kanban board + Data Table view with 6 stages (`New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`).
- **One-Click Lead Conversion**: Convert qualified leads directly into active Customers and Closed Won deals with celebration animations.
- **Deals & Contracts**: Deal stages, value estimation, probability scoring, and closing date calendars.
- **Customer Directory**: Customer profiles, lifetime revenue tracking, and account ownership.
- **Tasks & Follow-ups**: Schedule sales calls, demos, and follow-ups with instant status toggles.
- **Leaderboard & Analytics**: Revenue attribution, top sales performer scorecards, and channel conversion metrics.

### 3. Dedicated Import & Export Hub
- **Spreadsheet Import**: Bulk upload records from **CSV** or **Excel (`.xlsx`, `.xls`)** with automated header normalization and validation for:
  - Leads
  - Deals
  - Customer Accounts
  - Staff / Team Members (Role checks strictly enforced)
- **Spreadsheet Export**: Instant 1-click download of all data in **CSV** or **Excel (`.xlsx`)** format.
- **Sample Templates**: Download pre-formatted `.csv` templates with proper column headers to eliminate data entry mistakes.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Running the Application

1. **Start the Server & CRM Portal**:
   ```bash
   node server/server.js
   ```
   The backend API and the compiled React production client will run at:
   👉 **http://localhost:5000**

2. **(Optional) Run in Development Mode with Hot Reload**:
   ```bash
   # In terminal 1 (server):
   npm run server

   # In terminal 2 (Vite React client):
   npm run client
   ```
   The Vite dev server will run at:
   👉 **http://localhost:3000** (proxied to API at port 5000)

---

## 🔑 Pre-Seeded Demo Accounts (One-Click Login)

The CRM comes pre-seeded with realistic enterprise data and one-click login buttons on the login screen:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@smartworkmart.com` | `password123` | Full control: create HRs & Employees, company-wide data |
| **HR Manager** | `hr@smartworkmart.com` | `password123` | Can create Employees + full sales capabilities |
| **Sales Rep** | `alex@smartworkmart.com` | `password123` | Sales account executive: leads, deals, tasks |
| **Sales Rep** | `emily@smartworkmart.com` | `password123` | Enterprise business development specialist |

---

## 📁 Project Structure

```
crm smart work mart/
├── client/                     # Frontend (Vite + React + Tailwind CSS)
│   ├── public/
│   │   └── logo.png            # Smart Work Mart Official Logo
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Modal, Toast
│   │   ├── context/            # AuthContext (JWT, permissions)
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Login page with 1-click demo switcher
│   │   │   ├── Dashboard.jsx   # KPI widgets, stage funnels, leaderboard
│   │   │   ├── Leads.jsx       # Kanban board & table with conversion
│   │   │   ├── Deals.jsx       # Sales pipeline & contracts
│   │   │   ├── Customers.jsx   # Customer account directory
│   │   │   ├── Tasks.jsx       # Task & call follow-up scheduler
│   │   │   ├── Users.jsx       # Role control (Admin & HR user management)
│   │   │   ├── ImportExport.jsx# CSV & Excel import/export center
│   │   │   └── Analytics.jsx   # Revenue analytics & rep scorecards
│   │   ├── utils/
│   │   │   └── api.js          # REST API client
│   │   ├── App.jsx             # Root application router
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind & typography styling
│   ├── tailwind.config.js      # Brand colors & themes
│   └── vite.config.js          # Vite configuration & proxy
│
├── server/                     # Backend API (Node.js & Express)
│   ├── data/
│   │   └── db.json             # Atomic JSON database
│   ├── middleware/
│   │   └── auth.js             # JWT verification & role authorization
│   ├── routes/
│   │   ├── auth.js             # Login, profile, password reset
│   │   ├── users.js            # User management (Admin/HR restrictions)
│   │   ├── leads.js            # Leads CRUD & conversion
│   │   ├── deals.js            # Deals pipeline
│   │   ├── customers.js        # Accounts management
│   │   ├── activities.js       # Tasks & reminders
│   │   ├── importExport.js     # CSV/Excel parsing & generation
│   │   └── analytics.js        # Aggregated KPI computations
│   ├── utils/
│   │   ├── db.js               # Safe atomic file database engine
│   │   └── seed.js             # Realistic initial CRM seed data
│   ├── package.json
│   └── server.js               # Express application entrypoint
│
└── package.json                # Root package configuration
```

---

## 🛡️ Security & Role Enforcement Details
- **HR Restrictions**: An HR user cannot escalate privileges to Admin, nor can they create another HR user. Attempts to send `role: "admin"` or `role: "hr"` by an HR token are strictly rejected with HTTP `403 Forbidden`.
- **Admin Management**: Admins have complete visibility and edit access across all team members, customer accounts, leads, deals, and audit logs.
- **Data Persistence**: Safe atomic write strategy ensures no corruption during simultaneous writes.
- **Export & Import Guardrails**: Role authorization is applied during bulk import. HR can import sales employees, but only Admins can import management profiles.

&copy; Smart Work Mart — *YOUR SEARCH ENDS HERE*
