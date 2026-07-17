import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Users, Activity, ToggleLeft, ToggleRight, Search, 
  Trash2, UserCheck, AlertOctagon, HelpCircle, RefreshCw, Key
} from 'lucide-react';
import { User, ActivityLog } from '../types';
import { api } from '../lib/api';

interface AdminPanelProps {
  currentUser: User | null;
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  // States
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'manager' | 'employee'>('all');

  const [msg, setMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingUsers(true);
    setLoadingLogs(true);
    try {
      const u = await api.getUsers();
      setUsers(u);
      
      const l = await api.getLogs();
      setLogs(l);
    } catch (err: any) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoadingUsers(false);
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle role updates (Admins only)
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setMsg(null);
    try {
      await api.updateUserRole(userId, newRole);
      setMsg('User role updated successfully!');
      await loadData();
    } catch (err: any) {
      setMsg('Action failed: ' + err.message);
    }
  };

  // Handle status toggle (Admins only)
  const handleStatusToggle = async (userId: string, currentStatus: 'active' | 'inactive') => {
    setMsg(null);
    const targetStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUserStatus(userId, targetStatus);
      setMsg(`User successfully marked ${targetStatus}.`);
      await loadData();
    } catch (err: any) {
      setMsg('Action failed: ' + err.message);
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!logSearch) return true;
      const q = logSearch.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    });
  }, [logs, logSearch]);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Administration Panel</h2>
          <p className="text-slate-500 text-xs mt-0.5">Manage portal credentials, active user roles, and security audit logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>Reload Logs</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 font-mono text-center">
          {msg}
        </div>
      )}

      {/* Grid of Users & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User list administration card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px] lg:col-span-1">
          <div className="border-b border-slate-100 pb-3.5 mb-3.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>User Operations</span>
            </h4>
            <p className="text-slate-400 text-[10px] mt-0.5">Authorizations & active session status</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {loadingUsers ? (
              <p className="text-center text-slate-400 text-xs">Querying LDAP users...</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{user.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">@{user.username} • {user.email}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                      user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>

                  {/* Actions for role update (visible only to admins, disabling self role update) */}
                  {isAdmin && user.id !== currentUser?.id && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>

                      <button
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                          user.status === 'active' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <span>{user.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Trail activity logs card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px] lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-3.5">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <span>Security Audit Log Streams</span>
              </h4>
              <p className="text-slate-400 text-[10px] mt-0.5">Un-editable system logs tracking predictions & updates</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter logs by keywords..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 outline-none text-[10px] font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 font-sans">
            {loadingLogs ? (
              <p className="text-center text-slate-400 text-xs">Querying database journals...</p>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center py-12 text-slate-400 font-semibold text-xs">No matching system logs found.</p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-medium space-y-1 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-slate-600">{log.userName} ({log.role.toUpperCase()})</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700">
                    <span className="bg-slate-100 text-slate-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded mr-1.5">{log.action}</span>
                    {log.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
