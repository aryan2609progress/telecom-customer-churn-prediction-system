import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, UserCheck, ShieldAlert, FileText, 
  Settings, Receipt, LayoutDashboard, Database, HelpCircle, Save, Plus, Clock, FileDown, CheckCircle
} from 'lucide-react';
import { Customer, FollowUp, User } from '../types';
import { api } from '../lib/api';
import PredictionModule from './PredictionModule';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
  onRefreshList: () => void;
  currentUser: User | null;
}

export default function CustomerDetail({ customerId, onBack, onRefreshList, currentUser }: CustomerDetailProps) {
  // States
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'churn' | 'followup'>('profile');
  
  // Follow up form state
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState<string | null>(null);

  // Load customer state
  const loadCustomerData = async () => {
    try {
      const cust = await api.getCustomer(customerId);
      setCustomer(cust);
      
      const allFollowups = await api.getFollowUps();
      setFollowups(allFollowups.filter(f => f.customerId === customerId));
      
      const allUsers = await api.getUsers();
      setUsers(allUsers);
      
      if (allUsers.length > 0) {
        setNewAssigneeId(allUsers[0].id);
      }
    } catch (err) {
      console.error("Error loading customer data:", err);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  // Handle saving new follow-up
  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setLoadingFollowUp(true);
    setFollowUpMsg(null);

    const assignee = users.find(u => u.id === newAssigneeId) || currentUser || users[0];

    try {
      await api.createFollowUp({
        customerId: customer.id,
        customerName: customer.personal.name,
        assignedToId: assignee.id,
        assignedToName: assignee.name,
        notes: newNotes,
        followUpDate: newDate,
        customerResponse: 'Pending outreach',
        status: 'Open'
      });
      setNewNotes('');
      setFollowUpMsg('Retention task scheduled successfully!');
      await loadCustomerData();
      onRefreshList();
    } catch (err: any) {
      setFollowUpMsg('Scheduling failed: ' + err.message);
    } finally {
      setLoadingFollowUp(false);
    }
  };

  // Close / Resolve Follow Up task
  const handleCloseFollowUp = async (id: string, currentNotes: string, response: string) => {
    try {
      await api.updateFollowUp(id, {
        notes: currentNotes + '\n[Resolved on ' + new Date().toLocaleDateString() + ']',
        customerResponse: response || 'Agreed to standard offer',
        status: 'Closed'
      });
      await loadCustomerData();
    } catch (err) {
      console.error("Error closing follow-up task:", err);
    }
  };

  if (!customer) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-semibold text-sm">Collating CRM subscriber profiles...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Printable Letterhead block (visible only during print) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8">
        <h1 className="text-3xl font-black text-slate-900">TELECONNECT GLOBAL REPORT</h1>
        <p className="text-slate-500 text-xs font-mono">Subscriber Retention Diagnostics & Risk Analysis Assessment • CONFIDENTIAL</p>
        <p className="text-slate-500 text-xs font-mono mt-1">Generated: {new Date().toLocaleDateString()} • Authority ID: System Exec</p>
      </div>

      {/* Back to registry Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            title="Return to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">{customer.personal.name}</h3>
            <span className="text-xs text-slate-400 font-mono tracking-wide">{customer.id} • Assigned rep: {customer.assignedEmployeeName || 'None'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Print button triggers native print layout */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card (Demographics Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm md:col-span-1 text-center flex flex-col justify-between space-y-4 print:border-0 print:p-0">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xl uppercase rounded-full flex items-center justify-center mb-3">
              {customer.personal.name.substring(0, 2)}
            </div>
            <h4 className="font-black text-slate-900 text-base">{customer.personal.name}</h4>
            <span className="text-xs text-slate-400 font-mono mt-0.5">{customer.id}</span>
          </div>

          <div className="border-t border-b border-slate-100 py-3 space-y-2 text-left">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.personal.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{customer.personal.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.personal.city}, {customer.personal.state}</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Churn risk bounds</span>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold font-mono ${
              customer.riskLevel === 'high' ? 'bg-red-100 text-red-700' : customer.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {customer.churnProbability}% ({customer.riskLevel.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Dynamic Detail tabs block */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm md:col-span-3 flex flex-col justify-between overflow-hidden print:border-0 print:p-0">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-150 bg-slate-50/50 print:hidden">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`flex-1 py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeSubTab === 'profile' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Customer Profile
            </button>
            <button
              onClick={() => setActiveSubTab('churn')}
              className={`flex-1 py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeSubTab === 'churn' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Churn & AI insights
            </button>
            <button
              onClick={() => setActiveSubTab('followup')}
              className={`flex-1 py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeSubTab === 'followup' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Follow-ups & Tasks ({followups.length})
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="p-6 flex-1 min-h-[300px]">
            {activeSubTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-slate-700 text-xs">
                {/* Personal & Family detail cards */}
                <div className="space-y-5">
                  <div className="space-y-3.5">
                    <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      <span>Demographics & House Hold</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-medium">
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Date of Birth</span><span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.personal.dob}</span></div>
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Gender & Age</span><span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.personal.gender}, {customer.personal.age} years</span></div>
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Senior Citizen</span><span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.family.seniorCitizen}</span></div>
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Partner & Dependents</span><span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.family.partner} partner, {customer.family.dependents} dependents</span></div>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Receipt className="w-4 h-4 text-indigo-500" />
                      <span>Billing & cumulative Rates</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-medium">
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Contract Type</span><span className="font-bold text-indigo-600 text-sm mt-0.5 block">{customer.billing.contract}</span></div>
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Paperless Billing</span><span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.billing.paperlessBilling}</span></div>
                      <div className="col-span-2"><span className="text-slate-400 block font-semibold uppercase text-[10px]">Payment Method</span><span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.billing.paymentMethod}</span></div>
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Monthly Cost</span><span className="font-black text-slate-950 text-sm mt-0.5 block">${customer.billing.monthlyCharges.toFixed(2)}</span></div>
                      <div><span className="text-slate-400 block font-semibold uppercase text-[10px]">Total cost paid</span><span className="font-black text-slate-950 text-sm mt-0.5 block">${customer.billing.totalCharges.toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Telecom service list */}
                <div className="space-y-3.5">
                  <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span>Active network Products</span>
                  </h5>
                  <div className="space-y-2 font-semibold">
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-600 font-bold">Network Tenure duration</span>
                      <span className="text-indigo-600 font-bold font-mono">{customer.telecom.tenure} Months active</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-600 font-bold">Phone Service Access</span>
                      <span className="text-slate-800 font-bold">{customer.telecom.phoneService}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-600 font-bold">Multiple Active Lines</span>
                      <span className="text-slate-800 font-bold">{customer.telecom.multipleLines}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-600 font-bold">Internet Line Tech</span>
                      <span className="text-indigo-600 font-bold">{customer.telecom.internetService}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-600 font-bold">Online Digital Security</span>
                      <span className="text-slate-800 font-bold">{customer.telecom.onlineSecurity}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-600 font-bold">Online Cloud Backup</span>
                      <span className="text-slate-800 font-bold">{customer.telecom.onlineBackup}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-slate-600 font-bold">Premium Tech Support</span>
                      <span className="text-slate-800 font-bold">{customer.telecom.techSupport}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'churn' && (
              <div className="animate-fade-in">
                <PredictionModule customer={customer} onRefreshCustomer={loadCustomerData} />
              </div>
            )}

            {activeSubTab === 'followup' && (
              <div className="space-y-6 animate-fade-in">
                {/* Schedule follow-up form */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl print:hidden">
                  <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3.5">
                    <Plus className="w-4 h-4 text-indigo-500" />
                    <span>Plan Retention Task</span>
                  </h5>
                  <form onSubmit={handleScheduleFollowUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Retention Call notes / Objectives</label>
                      <input
                        type="text"
                        required
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Offer complimentary security pack, negotiate contract lock-in..."
                        className="w-full mt-1.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-xs font-semibold text-slate-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Task Date</label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Assign Specialist</label>
                      <select
                        value={newAssigneeId}
                        onChange={(e) => setNewAssigneeId(e.target.value)}
                        className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none text-xs font-semibold text-slate-700"
                      >
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={loadingFollowUp || !newNotes}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs tracking-wide shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Schedule Task</span>
                      </button>
                    </div>
                  </form>
                  {followUpMsg && <p className="text-indigo-600 text-xs mt-2.5 font-bold font-mono">{followUpMsg}</p>}
                </div>

                {/* Follow up log list */}
                <div className="space-y-4">
                  <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Assigned Tasks & Outreaches ({followups.length})</span>
                  </h5>

                  <div className="space-y-3.5">
                    {followups.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 font-semibold text-xs">No retention tasks scheduled for this customer yet.</p>
                    ) : (
                      followups.map((fw) => (
                        <div key={fw.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                fw.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {fw.status} Task
                              </span>
                              <span className="text-xs text-slate-400 font-mono font-semibold">Date: {fw.followUpDate}</span>
                            </div>
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed">{fw.notes}</p>
                            <span className="text-[10px] text-slate-400 block font-mono">Assigned Staff: {fw.assignedToName}</span>
                          </div>

                          <div className="flex-shrink-0 text-right space-y-1.5">
                            {fw.status === 'Open' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCloseFollowUp(fw.id, fw.notes, 'Migrated to 1-Year contract')}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Mark Retained
                                </button>
                                <button
                                  onClick={() => handleCloseFollowUp(fw.id, fw.notes, 'Customer request closed (churned)')}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Mark Churned
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                                Outcome: {fw.customerResponse}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
