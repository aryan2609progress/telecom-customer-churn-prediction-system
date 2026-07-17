import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, CheckCircle, Search, AlertTriangle, ShieldCheck, ArrowRight, UserCheck, Trash2
} from 'lucide-react';
import { FollowUp } from '../types';
import { api } from '../lib/api';

interface FollowUpPanelProps {
  onSelectCustomer: (id: string) => void;
  onRefreshTrigger: number;
}

export default function FollowUpPanel({ onSelectCustomer, onRefreshTrigger }: FollowUpPanelProps) {
  // States
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Open' | 'Closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadFollowups = async () => {
    setLoading(true);
    try {
      const data = await api.getFollowUps();
      setFollowups(data);
    } catch (err) {
      console.error("Error loading followups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowups();
  }, [onRefreshTrigger]);

  // Filters & Search
  const filteredFollowups = useMemo(() => {
    return followups
      .filter(f => {
        if (filterStatus === 'all') return true;
        return f.status === filterStatus;
      })
      .filter(f => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          f.customerName.toLowerCase().includes(q) ||
          f.notes.toLowerCase().includes(q) ||
          f.assignedToName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime());
  }, [followups, filterStatus, searchQuery]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Follow-up Campaigns</h2>
          <p className="text-slate-500 text-xs mt-0.5">Track retention calls, contract updates, and outreach timelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSearchQuery(''); setFilterStatus('all'); loadFollowups(); }}
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
          >
            <span>Reload Feeds</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns, notes, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 pl-11 pr-4 py-2 rounded-xl border border-slate-200 outline-none transition-all text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-bold uppercase font-mono">Filter Status:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setFilterStatus('Open')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'Open' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Open Tasks
          </button>
          <button
            onClick={() => setFilterStatus('Closed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'Closed' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Resolved Campaigns
          </button>
        </div>
      </div>

      {/* Grid of outreaches */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold text-sm">Reloading outreach registry...</div>
      ) : filteredFollowups.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-sm text-slate-400">
          <Clock className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No follow-ups matches</h4>
          <p className="text-xs max-w-sm mx-auto mt-1">There are no outstanding outreach or follow-up campaigns matching the search bounds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFollowups.map((fw) => {
            const isOpen = fw.status === 'Open';
            return (
              <div key={fw.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{fw.customerName}</h4>
                      <span className="text-[10px] text-indigo-500 font-mono font-bold mt-1 block">SUBSCRIBER ID: {fw.customerId}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isOpen ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {fw.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {fw.notes}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Outreach Date</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">{fw.followUpDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Specialist</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">{fw.assignedToName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {fw.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectCustomer(fw.customerId)}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-bold transition-all"
                    >
                      <span>Full Diagnostic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
