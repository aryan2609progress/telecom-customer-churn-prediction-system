import React, { useMemo } from 'react';
import { 
  Users, AlertTriangle, CheckCircle, TrendingUp, DollarSign, ArrowRight, ShieldAlert, Calendar, Activity, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Customer, ActivityLog } from '../types';

interface DashboardProps {
  customers: Customer[];
  logs: ActivityLog[];
  onNavigateToCustomers: () => void;
  onSelectCustomer: (id: string) => void;
  onRefresh: () => void;
}

export default function Dashboard({ customers, logs, onNavigateToCustomers, onSelectCustomer, onRefresh }: DashboardProps) {
  // Compute key KPI metrics
  const stats = useMemo(() => {
    const total = customers.length;
    const high = customers.filter(c => c.riskLevel === 'high').length;
    const medium = customers.filter(c => c.riskLevel === 'medium').length;
    const low = customers.filter(c => c.riskLevel === 'low').length;
    
    // Revenue at Risk (Monthly charges of High risk customers)
    const revenueAtRisk = customers
      .filter(c => c.riskLevel === 'high')
      .reduce((sum, c) => sum + c.billing.monthlyCharges, 0);

    const averageTenure = total > 0 
      ? Math.round(customers.reduce((sum, c) => sum + c.telecom.tenure, 0) / total) 
      : 0;

    return { total, high, medium, low, revenueAtRisk, averageTenure };
  }, [customers]);

  // Chart 1: Risk Distribution (Pie)
  const riskDistributionData = useMemo(() => [
    { name: 'High Risk (≥70%)', value: stats.high, color: '#EF4444' },
    { name: 'Medium Risk (40-69%)', value: stats.medium, color: '#F59E0B' },
    { name: 'Low Risk (<40%)', value: stats.low, color: '#10B981' }
  ], [stats]);

  // Chart 2: Contract-wise Risk (Grouped Bar)
  const contractChurnData = useMemo(() => {
    const contracts = ['Month-to-month', 'One year', 'Two year'];
    return contracts.map(contract => {
      const contractCusts = customers.filter(c => c.billing.contract === contract);
      const totalInContract = contractCusts.length;
      const highRiskInContract = contractCusts.filter(c => c.riskLevel === 'high').length;
      return {
        name: contract,
        'Total Subscribers': totalInContract,
        'High Risk': highRiskInContract
      };
    });
  }, [customers]);

  // Chart 3: Internet Service Analysis (Bar)
  const internetServiceData = useMemo(() => {
    const services = ['Fiber optic', 'DSL', 'No'];
    return services.map(service => {
      const matched = customers.filter(c => c.telecom.internetService === service);
      const highRiskCount = matched.filter(c => c.riskLevel === 'high').length;
      return {
        name: service === 'No' ? 'No Internet' : service,
        'Total Subscribers': matched.length,
        'High Risk Churn': highRiskCount
      };
    });
  }, [customers]);

  // Chart 4: Simulated monthly churn trend
  const trendData = [
    { month: 'Feb', 'Avg Churn Risk (%)': 28 },
    { month: 'Mar', 'Avg Churn Risk (%)': 31 },
    { month: 'Apr', 'Avg Churn Risk (%)': 34 },
    { month: 'May', 'Avg Churn Risk (%)': 42 },
    { month: 'Jun', 'Avg Churn Risk (%)': 38 },
    { month: 'Jul', 'Avg Churn Risk (%)': 46 }
  ];

  // High Risk Customers alert list
  const highRiskCustomers = useMemo(() => {
    return customers
      .filter(c => c.riskLevel === 'high')
      .sort((a, b) => b.churnProbability - a.churnProbability)
      .slice(0, 5);
  }, [customers]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in bg-slate-50/50 min-h-screen">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive CRM Intelligence</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time predictive dashboard & customer health monitoring system.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Feeds</span>
          </button>
          <button 
            onClick={onNavigateToCustomers}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-indigo-600/10 transition-all duration-150"
          >
            <span>Customer Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Subscribers</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.total}</h3>
            <span className="text-xs text-slate-500 mt-1 block">Active TeleConnect contracts</span>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-rose-500 uppercase">High Churn Risk</span>
            <h3 className="text-3xl font-black text-rose-600 mt-1">{stats.high}</h3>
            <span className="text-xs text-rose-500/80 mt-1 block">Requires priority follow-up</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl text-rose-600">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase">Medium Churn Risk</span>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.medium}</h3>
            <span className="text-xs text-amber-500/80 mt-1 block">Intermediate vulnerability</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-teal-600 uppercase">Revenue At Risk</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">${stats.revenueAtRisk.toFixed(2)}<span className="text-lg font-normal text-slate-500">/mo</span></h3>
            <span className="text-xs text-rose-500 font-medium mt-1 block">MRR from High Risk accounts</span>
          </div>
          <div className="p-4 bg-red-50 rounded-xl text-rose-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[400px]">
          <div>
            <h4 className="text-base font-bold text-slate-900">Churn Risk Segmentation</h4>
            <p className="text-slate-500 text-xs mt-0.5">Subscriber base risk split ratio</p>
          </div>
          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Customers`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">{customers.length}</span>
              <span className="text-xs font-mono text-slate-400">Total Profiled</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-medium border-t border-slate-100 pt-4">
            {riskDistributionData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-600">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contract-Wise Churn Risk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[400px] lg:col-span-2">
          <div>
            <h4 className="text-base font-bold text-slate-900">Contract & Risk Matrix</h4>
            <p className="text-slate-500 text-xs mt-0.5">High-risk concentration vs contract type</p>
          </div>
          <div className="flex-1 min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractChurnData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                <Bar dataKey="Total Subscribers" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="High Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[380px]">
          <div>
            <h4 className="text-base font-bold text-slate-900">Historical Churn Risk Index</h4>
            <p className="text-slate-500 text-xs mt-0.5">Average probability movement past 6 months</p>
          </div>
          <div className="flex-1 min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="Avg Churn Risk (%)" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorChurn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Internet service analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[380px]">
          <div>
            <h4 className="text-base font-bold text-slate-900">Internet Technology Vulnerability</h4>
            <p className="text-slate-500 text-xs mt-0.5">Internet network medium vs High churn risk</p>
          </div>
          <div className="flex-1 min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={internetServiceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                <Bar dataKey="Total Subscribers" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="High Risk Churn" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Widgets Grid: Alert List & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Alert List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span>High-Risk Accounts Alert</span>
              </h4>
              <p className="text-slate-500 text-xs mt-0.5">Top critical churn vectors requiring retention intervention</p>
            </div>
            <span className="bg-rose-50 text-rose-600 font-mono text-xs font-bold px-2 py-1 rounded-lg">
              {stats.high} Priority
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5">
            {highRiskCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold">Zero accounts in High Risk bounds!</p>
                <p className="text-xs">Great job. Keep subscription loyalty high.</p>
              </div>
            ) : (
              highRiskCustomers.map((cust) => (
                <div 
                  key={cust.id}
                  onClick={() => onSelectCustomer(cust.id)}
                  className="group flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold flex items-center justify-center uppercase text-sm">
                      {cust.personal.name.substring(0, 2)}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-150">{cust.personal.name}</h5>
                      <span className="text-xs text-slate-400 font-mono block">{cust.id} • {cust.billing.contract}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-rose-100 text-rose-700 text-xs font-bold font-mono px-2.5 py-1 rounded-full">
                      {cust.churnProbability}% Probability
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">MRR: ${cust.billing.monthlyCharges}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Trail Activity Logs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                <span>Executive Activity Logs</span>
              </h4>
              <p className="text-slate-500 text-xs mt-0.5">Real-time audit trailing of CRM actions</p>
            </div>
            <span className="bg-indigo-50 text-indigo-600 font-mono text-xs px-2.5 py-1 rounded-lg">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 font-sans">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex gap-3 text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-slate-400 mb-0.5 font-mono">
                    <span className="font-semibold text-slate-600">{log.userName} ({log.role.toUpperCase()})</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mr-1.5">{log.action}</span>
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
