import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Award,
  DollarSign,
  TrendingUp,
  Target,
  PieChart,
  Users,
  Briefcase
} from 'lucide-react';

export default function Analytics() {
  const { user, isAdmin, isHR } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDashboardAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const repPerformance = data?.repPerformance || [];
  const sources = data?.sources || [];
  const stageCounts = data?.stageCounts || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            Executive Performance Metrics
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sales & Operational Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time revenue attribution, salesperson scorecards, and deal conversion velocity
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-slate-900">
            ${(kpis.wonRevenue || 0).toLocaleString()}
          </div>
          <div className="text-xs font-bold text-emerald-600">Total Company Won Revenue</div>
        </div>
      </div>

      {/* Rep Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Sales Team Leaderboard</h3>
            <p className="text-xs text-slate-500">Ranked by closed revenue contribution</p>
          </div>
          <Award className="w-5 h-5 text-amber-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Sales Person / HR</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Active Leads</th>
                <th className="py-3 px-4">Deals Won</th>
                <th className="py-3 px-4 font-bold text-slate-900">Total Closed Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {repPerformance.map((rep, idx) => (
                <tr key={rep.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                      idx === 0 ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {rep.name}
                      {rep.role === 'hr' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-800">
                          HR & SALES
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{rep.title}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {rep.department}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {rep.leadsCount} leads
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">
                    {rep.wonCount} won
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-sm text-slate-900">
                    ${(rep.revenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sources and Funnel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lead Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Inbound Lead Sources</h3>
              <p className="text-xs text-slate-500">Channel origin of business inquiries</p>
            </div>
            <PieChart className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {sources.map((src) => {
              const total = sources.reduce((s, x) => s + x.count, 0) || 1;
              const pct = Math.round((src.count / total) * 100);

              return (
                <div key={src.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{src.name}</span>
                    <span className="text-slate-500">{src.count} leads ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Stage Conversion Ratio</h3>
              <p className="text-xs text-slate-500">Pipeline progression health</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="space-y-3">
            {stageCounts.map((sc) => (
              <div key={sc.stage} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-800">{sc.stage}</span>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900">${(sc.value || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{sc.count} active inquiries</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
