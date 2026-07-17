import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, AlertTriangle, ShieldAlert, LogOut, CheckCircle, RefreshCw, X, Menu, Key
} from 'lucide-react';
import { Customer, User, ActivityLog } from './types';
import { api } from './lib/api';

// Components
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import FollowUpPanel from './components/FollowUpPanel';
import AdminPanel from './components/AdminPanel';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  // Session / Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Active navigation view state
  const [activeView, setActiveView] = useState<'dashboard' | 'customers' | 'followups' | 'admin' | 'settings'>('dashboard');
  
  // Selected customer ID for detailed diagnostic view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Global lists cache
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Notifications bell trigger state
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check login on mount
  useEffect(() => {
    const saved = localStorage.getItem('telecom_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        api.setAuthHeader(parsed.id);
      } catch (err) {
        console.error("Invalid session format:", err);
      }
    }
    setLoadingAuth(false);
  }, []);

  // Fetch all customers & activity logs
  const loadCustomersAndLogs = async () => {
    if (!user) return;
    setLoadingCustomers(true);
    setErrorMsg(null);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
      
      const activityData = await api.getLogs();
      setLogs(activityData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync CRM customer database');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadCustomersAndLogs();
  }, [user]);

  // High-risk customer alerts list
  const highRiskCustomers = useMemo(() => {
    return customers.filter(c => c.riskLevel === 'high');
  }, [customers]);

  // Auth logout handler
  const handleLogout = () => {
    localStorage.removeItem('telecom_user');
    api.setAuthHeader('');
    setUser(null);
    setSelectedCustomerId(null);
    setActiveView('dashboard');
  };

  // Auth login handler
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    api.setAuthHeader(loggedInUser.id);
  };

  // Customer DB CRUD Actions
  const handleCreateCustomer = async (custData: any) => {
    try {
      await api.createCustomer(custData);
      await loadCustomersAndLogs();
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    }
  };

  const handleUpdateCustomer = async (id: string, custData: any) => {
    try {
      await api.updateCustomer(id, custData);
      await loadCustomersAndLogs();
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert("Modify profile failed: " + err.message);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      await loadCustomersAndLogs();
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loadingAuth) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans font-semibold">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>Validating system operational credentials...</span>
      </div>
    );
  }

  // Not Authenticated -> Show beautiful Login Card
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* 1. Sidebar Navigation panel (hidden on print) */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200/80 print:hidden">
        <Navigation 
          activeTab={activeView}
          setActiveTab={(view: any) => {
            setSelectedCustomerId(null);
            setActiveView(view);
          }}
          currentUser={user}
          onLogout={handleLogout}
        />
      </div>

      {/* 2. Main content viewport area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header toolbar bar (hidden on print) */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              OPERATIONAL HUB • {user.role.toUpperCase()} SESSION
            </span>
          </div>

          <div className="flex items-center gap-4.5">
            {/* Quick alert notifications trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5"
                title="System Notifications"
              >
                <Bell className="w-4.5 h-4.5 text-slate-500" />
                {highRiskCustomers.length > 0 && (
                  <span className="bg-rose-100 text-rose-700 rounded-full px-1.5 py-0.5 text-[9px] font-mono font-black">
                    {highRiskCustomers.length}
                  </span>
                )}
              </button>

              {/* Notification Overlay Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4 space-y-3.5 max-h-[350px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-800">Critical High Churn Risks</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {highRiskCustomers.length === 0 ? (
                      <p className="text-center py-4 text-slate-400 font-semibold text-xs">All subscriber lines stable & secure.</p>
                    ) : (
                      highRiskCustomers.map(hc => (
                        <div 
                          key={hc.id}
                          onClick={() => {
                            setSelectedCustomerId(hc.id);
                            setActiveView('customers');
                            setShowNotifications(false);
                          }}
                          className="p-2.5 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl transition-all cursor-pointer flex gap-2.5 items-start"
                        >
                          <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{hc.personal.name}</span>
                            <span className="text-[10px] text-rose-600 font-bold font-mono uppercase">{hc.churnProbability}% risk level</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout trigger */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4.5">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{user.name}</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold block">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                title="De-authorize Session"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* 3. Render content view based on active tab state */}
        <main className="flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="m-8 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold font-mono text-red-700 flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => loadCustomersAndLogs()} className="p-1.5 hover:bg-red-100 rounded-lg transition-all">
                <RefreshCw className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}

          {/* If a customer diagnostic is chosen, render CustomerDetail */}
          {selectedCustomerId ? (
            <CustomerDetail 
              customerId={selectedCustomerId} 
              onBack={() => setSelectedCustomerId(null)} 
              onRefreshList={loadCustomersAndLogs}
              currentUser={user}
            />
          ) : (
            <>
              {activeView === 'dashboard' && (
                <Dashboard 
                  customers={customers} 
                  logs={logs}
                  onNavigateToCustomers={() => setActiveView('customers')}
                  onSelectCustomer={setSelectedCustomerId}
                  onRefresh={loadCustomersAndLogs}
                />
              )}
              {activeView === 'customers' && (
                <CustomerList 
                  customers={customers} 
                  onSelectCustomer={setSelectedCustomerId} 
                  onCreateCustomer={handleCreateCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  userRole={user.role}
                />
              )}
              {activeView === 'followups' && (
                <FollowUpPanel 
                  onSelectCustomer={setSelectedCustomerId} 
                  onRefreshTrigger={refreshTrigger}
                />
              )}
              {activeView === 'admin' && <AdminPanel currentUser={user} />}
              {activeView === 'settings' && <SettingsPanel currentUser={user} onRefreshUser={() => {}} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
