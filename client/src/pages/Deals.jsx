import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  Edit
} from 'lucide-react';

const DEAL_STAGES = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function Deals() {
  const { user, isAdmin, isHR } = useAuth();
  const { success, error } = useToast();

  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    customerName: '',
    contactEmail: '',
    amount: '',
    stage: 'Discovery',
    probability: 50,
    expectedCloseDate: '',
    assignedTo: ''
  });

  const fetchData = async () => {
    try {
      const [dealsRes, usersRes] = await Promise.all([
        api.getDeals({ search, stage: stageFilter !== 'all' ? stageFilter : '' }),
        api.getUsers()
      ]);
      setDeals(dealsRes);
      setUsers(usersRes);
    } catch (err) {
      error(err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, stageFilter]);

  const handleOpenCreate = () => {
    setEditingDeal(null);
    setFormData({
      title: '',
      customerName: '',
      contactEmail: '',
      amount: '',
      stage: 'Discovery',
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTo: user?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      customerName: deal.customerName || '',
      contactEmail: deal.contactEmail || '',
      amount: deal.amount || '',
      stage: deal.stage || 'Discovery',
      probability: deal.probability || 50,
      expectedCloseDate: deal.expectedCloseDate || '',
      assignedTo: deal.assignedTo || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await api.updateDeal(editingDeal.id, formData);
        success('Deal updated successfully!');
      } else {
        await api.createDeal(formData);
        success('Deal created successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    try {
      await api.deleteDeal(id);
      success('Deal deleted');
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleStageChange = async (deal, newStage) => {
    try {
      await api.updateDeal(deal.id, { stage: newStage });
      if (newStage === 'Closed Won') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        success(`Deal marked as CLOSED WON! 🏆`);
      } else {
        success(`Stage updated to ${newStage}`);
      }
      fetchData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleExport = (format = 'csv') => {
    window.open(api.getExportUrl('deals', format), '_blank');
  };

  const totalPipeline = deals.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const totalWon = deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-500" />
            Deals & Sales Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Pipeline: <span className="font-bold text-slate-800">${totalPipeline.toLocaleString()}</span> • Won Revenue: <span className="font-bold text-emerald-600">${totalWon.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExport('csv')}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Deals</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Deal
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
            placeholder="Search deals by title or customer..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="all">All Stages</option>
          {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Deals Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => {
            const isWon = deal.stage === 'Closed Won';
            const isLost = deal.stage === 'Closed Lost';

            return (
              <div
                key={deal.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{deal.title}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isWon 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isLost 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {deal.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{deal.customerName}</span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Deal Value</div>
                      <div className="text-base font-extrabold text-slate-900">
                        ${(deal.amount || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Probability</div>
                      <div className="text-sm font-bold text-amber-600">
                        {deal.probability}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Close: {deal.expectedCloseDate || 'TBD'}</span>
                    </div>
                    <div className="font-medium text-slate-700">
                      {deal.assignedName}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <select
                      value={deal.stage}
                      onChange={(e) => handleStageChange(deal, e.target.value)}
                      className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
                    >
                      {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(deal)}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(deal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {deals.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No deals match your search criteria. Click "+ Add New Deal" above!
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT DEAL MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDeal ? 'Edit Deal Information' : 'Create New Sales Deal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Smart Mart Procurement Solution"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Customer / Company *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Company Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@company.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Amount ($) *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="45000"
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
                {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Expected Close Date</label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assigned Sales Person</label>
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

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-400/20"
            >
              {editingDeal ? 'Update Deal' : 'Save Deal'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
