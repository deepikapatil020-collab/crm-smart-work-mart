import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Deals from './pages/Deals';
import Customers from './pages/Customers';
import Tasks from './pages/Tasks';
import UsersPage from './pages/Users';
import ImportExport from './pages/ImportExport';
import Analytics from './pages/Analytics';

export default function App() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-amber-400 font-bold tracking-widest text-xs uppercase">
            Loading Smart Work Mart CRM...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onOpenNewLead={() => setIsNewLeadModalOpen(true)}
        onOpenImport={() => setCurrentTab('import-export')}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              setCurrentTab={setCurrentTab}
              onOpenNewLead={() => setIsNewLeadModalOpen(true)}
            />
          )}

          {currentTab === 'leads' && (
            <Leads
              isNewModalOpen={isNewLeadModalOpen}
              setIsNewModalOpen={setIsNewLeadModalOpen}
            />
          )}

          {currentTab === 'deals' && <Deals />}

          {currentTab === 'customers' && <Customers />}

          {currentTab === 'tasks' && <Tasks />}

          {currentTab === 'users' && <UsersPage />}

          {currentTab === 'import-export' && <ImportExport />}

          {currentTab === 'analytics' && <Analytics />}
        </main>
      </div>
    </div>
  );
}
