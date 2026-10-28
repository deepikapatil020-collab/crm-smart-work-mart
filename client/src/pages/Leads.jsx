import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Search,
  Filter,
  Columns,
  List,
  DollarSign,
  User,
  Building,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit,
  ArrowRightCircle
} from 'lucide-react';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

export default function Leads({ isNewModalOpen, setIsNewModalOpen }) {
  const { user, isAdmin, isHR } = useAuth();
  const { success, error } = useToast();

  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [repFilter, setRepFilter] = useState('all');

  // Lead modal state
  const [editingLead, setEditingLead] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: '',
    stage: 'New',
    priority: 'medium',
    source: 'Website Form',
    assignedTo: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [leadsRes, usersRes] = await Promise.all([
        api.getLeads({ search, stage: stageFilter !== 'all' ? stageFilter : '', assignedTo: repFilter !== 'all' ? repFilter : '' }),
        api.getUsers()
      ]);
      setLeads(leadsRes);
      setUsers(usersRes);
    } catch (err) {
      error(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, stageFilter, repFilter]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      value: '',
      stage: 'New',
      priority: 'medium',
      source: 'Website Form',
      assignedTo: user?.id || '',
      notes: ''
    });
    setIsNewModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      value: lead.value || '',
      stage: lead.stage || 'New',
      priority: lead.priority || 'medium',
      source: lead.source || 'Website Form',
      assignedTo: lead.assignedTo || '',
      notes: lead.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createLead(formData);
      success('Lead created successfully!');
      setIsNewModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.updateLead(editingLead.id, formData);
      success('Lead updated successfully!');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.deleteLead(id);
      success('Lead removed');
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleStageChange = async (lead, newStage) => {
    try {
      await api.updateLead(lead.id, { stage: newStage });
      if (newStage === 'Won') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        success(`Lead moved to WON! 🎉`);
      } else {
        success(`Lead moved to ${newStage}`);
      }
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleConvertLead = async (lead) => {
    try {
      await api.convertLead(lead.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      success('Lead converted to Customer and Won Deal! 🚀');
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  // Quick export
  const handleQuickExport = (format = 'csv') => {
    const url = api.getExportUrl('leads', format);
    window.open(url, '_blank');
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">MED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" />
            Leads & Pipeline Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track inquiries, update sales stages, convert customers, and close deals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Quick Export Button */}
          <button
            onClick={() => handleQuickExport('csv')}
            title="Export leads to CSV"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Lead Button */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, company, email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Pipeline Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Assigned Rep Filter (Admin & HR see all reps) */}
          {(isAdmin || isHR) && (
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Sales Persons</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : viewMode === 'kanban' ? (
        
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STAGES.map((stage) => {
            const columnLeads = leads.filter(l => l.stage.toLowerCase() === stage.toLowerCase());
            const columnValue = columnLeads.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);

            return (
              <div key={stage} className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200 flex flex-col min-h-[500px]">
                
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {stage}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ${columnValue.toLocaleString()}
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-800 text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-xs space-y-2.5 relative group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="font-bold text-slate-900 leading-snug">{lead.name}</div>
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{lead.company}</span>
                          </div>
                        </div>
                        {getPriorityBadge(lead.priority)}
                      </div>

                      {/* Value */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Potential</span>
                        <span className="font-extrabold text-slate-900 text-xs">
                          ${(lead.value || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Assigned Rep */}
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-100">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{lead.assignedName}</span>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="text-amber-600 hover:text-amber-700 font-bold"
                        >
                          Edit
                        </button>

                        {lead.stage !== 'Won' && (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            title="Convert to Won & Customer"
                            className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                          >
                            <CheckCircle className="w-3 h-3" /> Convert
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Stage Shift Quick Selector */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Move to:</span>
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageChange(lead, e.target.value)}
                          className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none"
                        >
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center text-slate-400 text-[11px] font-medium">
                      No leads
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Contact & Company</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{lead.company}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{lead.email}</div>
                      <div className="text-slate-400 text-[11px]">{lead.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${(lead.value || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead, e.target.value)}
                        className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-lg px-2.5 py-1 focus:outline-none"
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      {getPriorityBadge(lead.priority)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {lead.assignedName}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.stage !== 'Won' && (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            title="Convert to Won Deal"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE LEAD MODAL */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Register New Lead - Smart Work Mart"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Liam Vance"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company / Organization *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Apex Logistics Inc."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@company.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Expected Value ($)</label>
              <input
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="25000"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Pipeline Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Website, Referral, Event..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assign To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Current User ({user?.name})</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Notes & Inquiries</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Requirements, customer budget, timeline..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-400/20"
            >
              Save Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT LEAD MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead Details"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Expected Value ($)</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assigned Person</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-400/20"
            >
              Update Lead
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
