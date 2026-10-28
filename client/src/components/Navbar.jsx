import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Briefcase, UserCheck, Bell, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenNewLead, onOpenImport }) {
  const { user, logout, isAdmin, isHR } = useAuth();

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          SYSTEM ADMIN (FULL ACCESS)
        </span>
      );
    }
    if (isHR) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-700 border border-sky-300">
          <Briefcase className="w-3.5 h-3.5 text-sky-600" />
          HR & SALES EXECUTIVE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-300">
        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
        SALES REPRESENTATIVE
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Smart Work Mart Logo" 
              className="h-10 w-auto object-contain drop-shadow-xs"
            />
            <div className="hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                Enterprise CRM Portal
              </span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            {getRoleBadge()}
          </div>
        </div>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onOpenNewLead && (
            <button
              onClick={onOpenNewLead}
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs tracking-wide shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              + Quick Lead
            </button>
          )}

          {/* User profile dropdown info */}
          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-inner ring-2 ring-amber-400/30 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>

            <div className="hidden md:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-800 truncate max-w-[150px]">{user?.name}</div>
              <div className="text-slate-500 truncate max-w-[150px]">{user?.email}</div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
