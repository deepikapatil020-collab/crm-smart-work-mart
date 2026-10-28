import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  ArrowUpRight, 
  ChevronRight,
  Briefcase,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Dashboard({ setCurrentTab, onOpenNewLead }) {
  const { user, isAdmin, isHR } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const stageCounts = data?.stageCounts || [];
  const repPerformance = data?.repPerformance || [];
  const recentLeads = data?.recentLeads || [];
  const recentDeals = data?.recentDeals || [];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner with Smart Work Mart Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Work Mart • Sales & Team HQ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {isAdmin 
                ? 'System Administrator Mode: Overseeing all sales operations, HR allocations, and company-wide performance.' 
                : isHR 
                ? 'HR & Sales Executive Mode: Managing recruitment, employee accounts, and active sales pipelines.'
                : 'Sales Representative Mode: Tracking your assigned opportunities, closing deals, and driving targets.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewLead}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Create Lead
            </button>
            <button
              onClick={() => setCurrentTab('import-export')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition"
            >
              Import / Export Hub
            </button>
          </div>
        </div>

        {/* Brand yellow glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Won Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Won Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              ${(kpis.wonRevenue || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target Achieved</span>
            </div>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Value</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              ${(kpis.totalPipelineValue || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Active open sales opportunities
            </div>
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Leads</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {kpis.totalLeads || 0}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Across all pipeline stages
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Conversion Rate</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900">
              {kpis.conversionRate || 0}%
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Lead to customer conversion
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Pipeline Funnel & Team Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Stage Funnel (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Sales Pipeline Stages</h3>
              <p className="text-xs text-slate-500">Progress of leads through the sales cycle</p>
            </div>
            <button
              onClick={() => setCurrentTab('leads')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Open Kanban Board <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {stageCounts.map((item) => {
              const maxCount = Math.max(...stageCounts.map(s => s.count), 1);
              const percentage = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{item.stage}</span>
                    <span className="text-slate-500">
                      {item.count} leads • ${(item.value || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.stage === 'Won'
                          ? 'bg-emerald-500'
                          : item.stage === 'Lost'
                          ? 'bg-slate-400'
                          : item.stage === 'Proposal Sent'
                          ? 'bg-amber-500'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Leaderboard (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Sales Leaderboard</h3>
                <p className="text-xs text-slate-500">Top contributors & closed revenue</p>
              </div>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            <div className="divide-y divide-slate-100 space-y-3">
              {repPerformance.slice(0, 4).map((rep, idx) => (
                <div key={rep.id} className="pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {rep.name}
                        {rep.role === 'hr' && (
                          <span className="px-1 py-0.2 bg-sky-100 text-sky-700 text-[9px] font-bold rounded">
                            HR
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{rep.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-600">
                      ${(rep.revenue || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {rep.wonCount} won / {rep.leadsCount} leads
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(isAdmin || isHR) && (
            <button
              onClick={() => setCurrentTab('users')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Users className="w-4 h-4 text-slate-500" />
              {isAdmin ? 'Manage All Staff & HRs' : 'Manage Sales Employees'}
            </button>
          )}
        </div>

      </div>

      {/* Recent Leads Table preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Recent Leads</h3>
            <p className="text-xs text-slate-500">Latest prospect inquiries registered in the CRM</p>
          </div>
          <button
            onClick={() => setCurrentTab('leads')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            View All Leads ({kpis.totalLeads}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Contact & Company</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Assigned Rep</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{lead.name}</div>
                    <div className="text-slate-400 text-[11px]">{lead.company} • {lead.email}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ${(lead.value || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {lead.assignedName}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {lead.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
