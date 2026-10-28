import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Briefcase, 
  Users, 
  CalendarCheck, 
  UserPlus, 
  FileSpreadsheet, 
  BarChart3,
  Building2,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { user, isAdmin, isHR } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'leads',
      label: 'Leads & Pipeline',
      icon: Target,
      badge: 'Hot'
    },
    {
      id: 'deals',
      label: 'Deals & Contracts',
      icon: Briefcase,
      badge: null
    },
    {
      id: 'customers',
      label: 'Customer Accounts',
      icon: Building2,
      badge: null
    },
    {
      id: 'tasks',
      label: 'Tasks & Follow-ups',
      icon: CalendarCheck,
      badge: null
    },
    {
      id: 'users',
      label: isAdmin ? 'Team & Role Control' : isHR ? 'Employee Management' : 'Team Directory',
      icon: UserPlus,
      badge: isAdmin ? 'Admin' : isHR ? 'HR' : null
    },
    {
      id: 'import-export',
      label: 'Import / Export Center',
      icon: FileSpreadsheet,
      badge: 'CSV/XLS'
    },
    {
      id: 'analytics',
      label: 'Sales Leaderboard',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      
      {/* Smart Work Mart Header Banner */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] tracking-widest uppercase font-extrabold text-amber-400">
          SMART WORK MART
        </div>
        <div className="text-xs text-slate-400 font-medium">
          YOUR SEARCH ENDS HERE
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-slate-800 text-amber-400 border border-amber-400/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role specific quick help card */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          Active Mode: <span className="text-amber-400 uppercase font-bold">{user?.role}</span>
        </div>
        {isAdmin && (
          <p className="leading-relaxed">
            Full management of HRs, Sales Reps, and company data pipeline.
          </p>
        )}
        {isHR && (
          <p className="leading-relaxed">
            Create employee accounts, manage sales, and drive revenue pipelines.
          </p>
        )}
        {!isAdmin && !isHR && (
          <p className="leading-relaxed">
            Manage your assigned leads, close deals, and schedule follow-ups.
          </p>
        )}
      </div>

    </aside>
  );
}
