import React from 'react';
import { 
  LayoutDashboard, Users, ShieldAlert, Settings, LogOut, FileText, Briefcase, HelpCircle, Activity
} from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Navigation({ activeTab, setActiveTab, currentUser, onLogout }: NavigationProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'employee'] },
    { id: 'followups', label: 'Follow-ups', icon: ShieldAlert, roles: ['admin', 'manager', 'employee'] },
    { id: 'admin', label: 'Admin Portal', icon: Briefcase, roles: ['admin', 'manager'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'employee'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-white">TeleConnect</h1>
          <span className="text-xs font-mono text-indigo-400 font-semibold tracking-wider uppercase">Churn Predict</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-mono text-slate-500 px-3 mb-2 tracking-wider uppercase">Main System</div>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section / Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        {currentUser && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-indigo-400 uppercase">
              {currentUser.username.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-100">{currentUser.name}</p>
              <p className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-wider">{currentUser.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          id="nav-logout-btn"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl font-medium transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Account</span>
        </button>
      </div>
    </aside>
  );
}
