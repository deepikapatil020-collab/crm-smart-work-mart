import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  UserCheck,
  Search,
  KeyRound,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Download
} from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, isAdmin, isHR } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: isHR ? 'employee' : 'employee', // default
    title: '',
    department: '',
    phone: '',
    status: 'active'
  });

  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res);
    } catch (err) {
      error(err.message || 'Failed to load team users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: isHR ? 'employee' : 'hr', // Admin defaults to HR or Employee, HR forced to employee
      title: isHR ? 'Sales Executive' : 'HR Specialist',
      department: isHR ? 'Sales & Operations' : 'Human Resources',
      phone: '',
      status: 'active'
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // optional on edit
      role: user.role || 'employee',
      title: user.title || '',
      department: user.department || '',
      phone: user.phone || '',
      status: user.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenResetPassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPasswordOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(formData);
      success(`${formData.role.toUpperCase()} account created successfully!`);
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err) {
      error(err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.updateUser(selectedUser.id, formData);
      success('User profile updated successfully!');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      error(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }
    try {
      await api.resetPassword(selectedUser.id, newPassword);
      success(`Password reset successfully for ${selectedUser.name}!`);
      setIsResetPasswordOpen(false);
    } catch (err) {
      error(err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser.id) {
      error('You cannot delete your own account');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove account for ${user.name}?`)) return;

    try {
      await api.deleteUser(user.id);
      success(`User ${user.name} removed`);
      fetchUsers();
    } catch (err) {
      error(err.message);
    }
  };

  const handleExportUsers = (format = 'csv') => {
    window.open(api.getExportUrl('users', format), '_blank');
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Shield className="w-3 h-3 text-amber-600" />
          ADMIN
        </span>
      );
    }
    if (role === 'hr') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
          <Briefcase className="w-3 h-3 text-sky-600" />
          HR MANAGER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <UserCheck className="w-3 h-3 text-emerald-600" />
        SALES REP
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            {isAdmin ? 'System User & Role Control' : isHR ? 'Employee Account Management' : 'Team Directory'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Admin authority: Create and manage HR and Employee accounts, reset credentials, and monitor access.'
              : isHR 
              ? 'HR authority: Create and onboard new Employee accounts, manage sales representatives.'
              : 'Smart Work Mart organizational directory.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {(isAdmin || isHR) && (
            <button
              onClick={() => handleExportUsers('csv')}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Team</span>
            </button>
          )}

          {(isAdmin || isHR) && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isAdmin ? '+ Create HR or Employee' : '+ Create Employee Account'}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team member by name, email, or department..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="employee">Employee / Sales</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department & Title</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  {(isAdmin || isHR) && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((u) => {
                  const canEditThisUser = isAdmin || (isHR && u.role === 'employee');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              {u.name}
                              {u.id === currentUser.id && (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{u.title || 'Staff'}</div>
                        <div className="text-[11px] text-slate-500">{u.department || 'Operations'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      {(isAdmin || isHR) && (
                        <td className="py-3.5 px-4 text-right">
                          {canEditThisUser ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenResetPassword(u)}
                                title="Reset User Password"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(u)}
                                title="Edit User"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {u.id !== currentUser.id && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Delete User"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Protected</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={isAdmin ? 'Create New HR or Employee Account' : 'Create New Employee Account'}
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-medium">
          
          {/* Role Selection Notification */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            {isAdmin ? (
              <p>
                <strong>Admin Privilege:</strong> You can create <strong>HR Accounts</strong> (to manage employees & sales) and <strong>Employee Accounts</strong> (sales reps).
              </p>
            ) : (
              <p>
                <strong>HR Privilege:</strong> You can create and onboard new <strong>Employee / Sales Accounts</strong>.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rachel Adams"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rachel@smartworkmart.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Account Role *</label>
              {isAdmin ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="hr">HR Account (Can create employees & manage sales)</option>
                  <option value="employee">Employee / Sales Person (Sales CRM pipeline)</option>
                  <option value="admin">Administrator (Complete system control)</option>
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value="Employee / Sales Person (HR Restricted)"
                  className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-600 cursor-not-allowed"
                />
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Initial Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Inside Sales Specialist"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Enterprise Sales"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 555-0199"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-400/20"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Profile: ${selectedUser?.name}`}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Role (Admin Only)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="hr">HR Account</option>
                <option value="employee">Employee / Sales Person</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

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
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        title={`Reset Password: ${selectedUser?.name}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-medium">
          <p className="text-slate-600">
            Set a new temporary password for <strong>{selectedUser?.name}</strong> ({selectedUser?.email}).
          </p>

          <div>
            <label className="block text-slate-700 font-bold mb-1">New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter at least 6 characters"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsResetPasswordOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-400/20"
            >
              Set New Password
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
