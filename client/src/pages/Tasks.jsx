import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import {
  CalendarCheck,
  Plus,
  PhoneCall,
  Video,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  Check
} from 'lucide-react';

export default function Tasks() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Call',
    dueDate: '',
    relatedTo: '',
    assignedTo: '',
    notes: ''
  });

  const fetchActivities = async () => {
    try {
      const [actRes, usersRes] = await Promise.all([
        api.getActivities(),
        api.getUsers()
      ]);
      setActivities(actRes);
      setUsers(usersRes);
    } catch (err) {
      error(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      type: 'Call',
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      relatedTo: '',
      assignedTo: user?.id || '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createActivity(formData);
      success('Activity reminder added!');
      setIsModalOpen(false);
      fetchActivities();
    } catch (err) {
      error(err.message);
    }
  };

  const handleToggleStatus = async (activity) => {
    const newStatus = activity.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateActivity(activity.id, { status: newStatus });
      success(`Activity marked as ${newStatus}`);
      fetchActivities();
    } catch (err) {
      error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteActivity(id);
      success('Activity deleted');
      fetchActivities();
    } catch (err) {
      error(err.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call':
        return <PhoneCall className="w-4 h-4 text-sky-500" />;
      case 'Meeting':
        return <Video className="w-4 h-4 text-purple-500" />;
      default:
        return <CalendarCheck className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-amber-500" />
            Tasks & Follow-up Actions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of sales calls, demonstrations, deadlines, and customer engagements
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Task / Call
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
          {activities.map((item) => {
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition ${
                  isCompleted ? 'opacity-60 bg-slate-50/40' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 hover:border-amber-500 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-slate-100">
                        {getTypeIcon(item.type)}
                      </div>
                      <span className={`text-xs font-bold text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {item.title}
                      </span>
                      {item.relatedTo && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                          {item.relatedTo}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-slate-500 pl-7">{item.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right text-slate-500">
                    <div className="font-semibold text-slate-700 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.dueDate ? new Date(item.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No date'}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.assignedName}</div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-xs">
              No tasks scheduled. Schedule your next follow-up call or client meeting!
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Task, Follow-up, or Call"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Follow-up demo call with NexTech"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Task">Task / Email</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Due Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Related Company / Lead</label>
              <input
                type="text"
                value={formData.relatedTo}
                onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value })}
                placeholder="e.g. Apex Logistics"
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
            <label className="block text-slate-700 font-bold mb-1">Action Items / Agenda</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Call objectives, discussion topics..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
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
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
