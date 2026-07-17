import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, Edit, Eye, Trash2, Download, AlertTriangle, CheckCircle, RefreshCw, X, SlidersHorizontal
} from 'lucide-react';
import { Customer } from '../types';
import { exportCustomersToCSV } from '../lib/export';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onCreateCustomer: (customerData: any) => void;
  onUpdateCustomer: (id: string, customerData: any) => void;
  onDeleteCustomer: (id: string) => void;
  userRole: string;
}

export default function CustomerList({ 
  customers, onSelectCustomer, onCreateCustomer, onUpdateCustomer, onDeleteCustomer, userRole 
}: CustomerListProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'id' | 'name' | 'email' | 'phone'>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterContract, setFilterContract] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'probability' | 'tenure' | 'charges'>('probability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drawer / Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState(35);
  const [dob, setDob] = useState('1991-01-01');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [seniorCitizen, setSeniorCitizen] = useState<'Yes' | 'No'>('No');
  const [partner, setPartner] = useState<'Yes' | 'No'>('No');
  const [dependents, setDependents] = useState<'Yes' | 'No'>('No');
  
  // Telecom fields
  const [tenure, setTenure] = useState(12);
  const [phoneService, setPhoneService] = useState<'Yes' | 'No'>('Yes');
  const [multipleLines, setMultipleLines] = useState<'Yes' | 'No' | 'No phone service'>('No');
  const [internetService, setInternetService] = useState<'DSL' | 'Fiber optic' | 'No'>('DSL');
  const [onlineSecurity, setOnlineSecurity] = useState<'Yes' | 'No' | 'No internet service'>('No');
  const [onlineBackup, setOnlineBackup] = useState<'Yes' | 'No' | 'No internet service'>('No');
  const [deviceProtection, setDeviceProtection] = useState<'Yes' | 'No' | 'No internet service'>('No');
  const [techSupport, setTechSupport] = useState<'Yes' | 'No' | 'No internet service'>('No');
  const [streamingTV, setStreamingTV] = useState<'Yes' | 'No' | 'No internet service'>('No');
  const [streamingMovies, setStreamingMovies] = useState<'Yes' | 'No' | 'No internet service'>('No');

  // Billing fields
  const [contract, setContract] = useState<'Month-to-month' | 'One year' | 'Two year'>('Month-to-month');
  const [paperlessBilling, setPaperlessBilling] = useState<'Yes' | 'No'>('Yes');
  const [paymentMethod, setPaymentMethod] = useState<'Electronic check' | 'Mailed check' | 'Bank transfer (automatic)' | 'Credit card (automatic)'>('Electronic check');
  const [monthlyCharges, setMonthlyCharges] = useState(55.00);
  const [totalCharges, setTotalCharges] = useState(660.00);

  // Compute available filter lists
  const cities = useMemo(() => {
    const list = customers.map(c => c.personal.city);
    return Array.from(new Set(list));
  }, [customers]);

  // Reset form helper
  const resetForm = () => {
    setName('');
    setGender('Male');
    setAge(35);
    setDob('1991-01-01');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setSeniorCitizen('No');
    setPartner('No');
    setDependents('No');
    setTenure(12);
    setPhoneService('Yes');
    setMultipleLines('No');
    setInternetService('DSL');
    setOnlineSecurity('No');
    setOnlineBackup('No');
    setDeviceProtection('No');
    setTechSupport('No');
    setStreamingTV('No');
    setStreamingMovies('No');
    setContract('Month-to-month');
    setPaperlessBilling('Yes');
    setPaymentMethod('Electronic check');
    setMonthlyCharges(55.00);
    setTotalCharges(660.00);
    setEditingCustomerId(null);
  };

  // Open Edit Form helper
  const openEditForm = (c: Customer) => {
    setEditingCustomerId(c.id);
    setName(c.personal.name);
    setGender(c.personal.gender);
    setAge(c.personal.age);
    setDob(c.personal.dob);
    setPhone(c.personal.phone);
    setEmail(c.personal.email);
    setAddress(c.personal.address);
    setCity(c.personal.city);
    setState(c.personal.state);
    setPincode(c.personal.pincode);
    setSeniorCitizen(c.family.seniorCitizen);
    setPartner(c.family.partner);
    setDependents(c.family.dependents);
    setTenure(c.telecom.tenure);
    setPhoneService(c.telecom.phoneService);
    setMultipleLines(c.telecom.multipleLines);
    setInternetService(c.telecom.internetService);
    setOnlineSecurity(c.telecom.onlineSecurity);
    setOnlineBackup(c.telecom.onlineBackup);
    setDeviceProtection(c.telecom.deviceProtection);
    setTechSupport(c.telecom.techSupport);
    setStreamingTV(c.telecom.streamingTV);
    setStreamingMovies(c.telecom.streamingMovies);
    setContract(c.billing.contract);
    setPaperlessBilling(c.billing.paperlessBilling);
    setPaymentMethod(c.billing.paymentMethod);
    setMonthlyCharges(c.billing.monthlyCharges);
    setTotalCharges(c.billing.totalCharges);
    setIsFormOpen(true);
  };

  // Submit Form helper
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      personal: {
        name, gender, age, dob, phone, email, address, city, state, country: 'India', pincode
      },
      family: { seniorCitizen, partner, dependents },
      telecom: { 
        tenure: Number(tenure), 
        phoneService, 
        multipleLines: phoneService === 'No' ? 'No phone service' : multipleLines, 
        internetService, 
        onlineSecurity: internetService === 'No' ? 'No internet service' : onlineSecurity,
        onlineBackup: internetService === 'No' ? 'No internet service' : onlineBackup,
        deviceProtection: internetService === 'No' ? 'No internet service' : deviceProtection,
        techSupport: internetService === 'No' ? 'No internet service' : techSupport,
        streamingTV: internetService === 'No' ? 'No internet service' : streamingTV,
        streamingMovies: internetService === 'No' ? 'No internet service' : streamingMovies
      },
      billing: { 
        contract, 
        paperlessBilling, 
        paymentMethod, 
        monthlyCharges: Number(monthlyCharges), 
        totalCharges: Number(totalCharges) 
      }
    };

    if (editingCustomerId) {
      onUpdateCustomer(editingCustomerId, payload);
    } else {
      onCreateCustomer(payload);
    }
    setIsFormOpen(false);
    resetForm();
  };

  // Apply Search and Filters
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((cust) => {
        // 1. Search Query
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        
        if (searchField === 'id') {
          return cust.id.toLowerCase().includes(q);
        } else if (searchField === 'name') {
          return cust.personal.name.toLowerCase().includes(q);
        } else if (searchField === 'email') {
          return cust.personal.email.toLowerCase().includes(q);
        } else if (searchField === 'phone') {
          return cust.personal.phone.toLowerCase().includes(q);
        } else {
          // 'all'
          return (
            cust.id.toLowerCase().includes(q) ||
            cust.personal.name.toLowerCase().includes(q) ||
            cust.personal.email.toLowerCase().includes(q) ||
            cust.personal.phone.toLowerCase().includes(q)
          );
        }
      })
      .filter((cust) => {
        // 2. Risk Level Filter
        if (filterRisk === 'all') return true;
        return cust.riskLevel === filterRisk;
      })
      .filter((cust) => {
        // 3. Contract Filter
        if (filterContract === 'all') return true;
        return cust.billing.contract === filterContract;
      })
      .filter((cust) => {
        // 4. City Filter
        if (filterCity === 'all') return true;
        return cust.personal.city === filterCity;
      })
      .sort((a, b) => {
        // 5. Sorting
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.personal.name.localeCompare(b.personal.name);
        } else if (sortBy === 'probability') {
          comparison = a.churnProbability - b.churnProbability;
        } else if (sortBy === 'tenure') {
          comparison = a.telecom.tenure - b.telecom.tenure;
        } else if (sortBy === 'charges') {
          comparison = a.billing.monthlyCharges - b.billing.monthlyCharges;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [customers, searchQuery, searchField, filterRisk, filterContract, filterCity, sortBy, sortOrder]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Table Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Database Hub</h2>
          <p className="text-slate-500 text-xs mt-0.5">Manage subscriber contract metrics, demographics, and risk values.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCustomersToCSV(filteredCustomers)}
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          {userRole !== 'employee' && (
            <button
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>New Subscriber</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter / Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm space-y-4">
        {/* Search row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:border-indigo-500 outline-none transition-all duration-150 text-sm font-medium"
            />
          </div>
          <div>
            <select
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="w-full bg-slate-50/50 text-slate-700 py-2.5 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium"
            >
              <option value="all">Search All Columns</option>
              <option value="id">Search Customer ID</option>
              <option value="name">Search Name</option>
              <option value="email">Search Email</option>
              <option value="phone">Search Mobile Number</option>
            </select>
          </div>
          <div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full bg-slate-50/50 text-slate-700 py-2.5 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium"
            >
              <option value="all">Risk Level: All</option>
              <option value="high">High Churn Risk (≥70%)</option>
              <option value="medium">Medium Risk (40-69%)</option>
              <option value="low">Low Risk (&lt;40%)</option>
            </select>
          </div>
        </div>

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Slice Data:</span>
            </div>
            {/* Contract Filter */}
            <select
              value={filterContract}
              onChange={(e) => setFilterContract(e.target.value)}
              className="bg-slate-100/70 hover:bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold outline-none border border-transparent hover:border-slate-200 transition-all duration-150"
            >
              <option value="all">Contract: All Types</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>

            {/* City Filter */}
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="bg-slate-100/70 hover:bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold outline-none border border-transparent hover:border-slate-200 transition-all duration-150"
            >
              <option value="all">City: All</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Order by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-100/70 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none"
            >
              <option value="probability">Churn Risk Probability</option>
              <option value="name">Customer Full Name</option>
              <option value="tenure">Contract Tenure</option>
              <option value="charges">Monthly Plan Pricing</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-slate-100/70 hover:bg-slate-100 text-slate-700 p-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wide transition-all"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Main Customers Grid/Table */}
      <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Tenure & Contract</th>
                <th className="px-6 py-4">Network Services</th>
                <th className="px-6 py-4 text-right">Charges</th>
                <th className="px-6 py-4 text-center">Churn Risk</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-sans font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                    No customer profiles matched the active filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isHigh = cust.riskLevel === 'high';
                  const isMedium = cust.riskLevel === 'medium';
                  
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs uppercase border ${
                            isHigh ? 'bg-red-50 text-red-600 border-red-100' : isMedium ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {cust.personal.name.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-snug">{cust.personal.name}</span>
                            <span className="text-xs text-slate-400 font-mono block mt-0.5">{cust.id} • {cust.personal.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tenure & Contract */}
                      <td className="px-6 py-4.5">
                        <span className="font-semibold text-slate-800 block">{cust.telecom.tenure} months tenure</span>
                        <span className="text-xs text-slate-400 font-mono block mt-0.5">{cust.billing.contract}</span>
                      </td>

                      {/* Network Tech */}
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          cust.telecom.internetService === 'Fiber optic' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : cust.telecom.internetService === 'DSL' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {cust.telecom.internetService === 'No' ? 'Voice Only' : `${cust.telecom.internetService} Internet`}
                        </span>
                        <div className="flex gap-1.5 mt-1">
                          {cust.telecom.techSupport === 'Yes' && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">TechSupport</span>}
                          {cust.telecom.onlineSecurity === 'Yes' && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Security</span>}
                        </div>
                      </td>

                      {/* Financial Charges */}
                      <td className="px-6 py-4.5 text-right font-mono">
                        <span className="font-bold text-slate-900 block">${cust.billing.monthlyCharges.toFixed(2)}<span className="text-[10px] text-slate-400">/mo</span></span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Total: ${cust.billing.totalCharges.toFixed(2)}</span>
                      </td>

                      {/* Risk Percentage */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                            isHigh ? 'bg-red-100 text-red-700' : isMedium ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {cust.churnProbability}% Risk
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold mt-1 tracking-wider">{cust.riskLevel}</span>
                        </div>
                      </td>

                      {/* Actions row */}
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => onSelectCustomer(cust.id)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200/50 hover:border-indigo-100 rounded-lg transition-all"
                            title="Analyze Retentions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {userRole !== 'employee' && (
                            <>
                              <button
                                onClick={() => openEditForm(cust)}
                                className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-600 border border-slate-200/50 hover:border-amber-100 rounded-lg transition-all"
                                title="Edit Subscriber"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { if (confirm(`Delete Customer Profile: ${cust.personal.name}?`)) onDeleteCustomer(cust.id); }}
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/50 hover:border-rose-100 rounded-lg transition-all"
                                title="Delete Profile"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Slide-Over / Full Drawer Modal Form for Add/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-white h-screen flex flex-col justify-between shadow-2xl relative animate-slide-left border-l border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{editingCustomerId ? 'Modify Subscriber Profile' : 'Register New Subscriber'}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Define demographic bounds, contract rates, and network tech lines.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields body Scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Section 1: Demographics */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider">I. Customer Personal Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                    <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
                    <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                    <input type="number" required value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                    <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Pincode</label>
                    <input type="text" required value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Street Address</label>
                    <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                    <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">State</label>
                    <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Section 2: Family status */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider">II. Family & Household Profile</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Senior Citizen</label>
                    <select value={seniorCitizen} onChange={(e: any) => setSeniorCitizen(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Has Partner</label>
                    <select value={partner} onChange={(e: any) => setPartner(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Has Dependents</label>
                    <select value={dependents} onChange={(e: any) => setDependents(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Telecom services details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider">III. Telecom Network Lines & Subscriptions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Tenure (In Months)</label>
                    <input type="number" required min={0} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Service Lines</label>
                    <select value={phoneService} onChange={(e: any) => setPhoneService(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="Yes">Yes (Active)</option>
                      <option value="No">No Service</option>
                    </select>
                  </div>
                  {phoneService === 'Yes' && (
                    <div className="col-span-2 animate-fade-in">
                      <label className="text-xs font-bold text-slate-500 uppercase">Multiple Lines Subscribed</label>
                      <select value={multipleLines} onChange={(e: any) => setMultipleLines(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                        <option value="No">Single Line</option>
                        <option value="Yes">Multiple Lines Active</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Internet Technology Type</label>
                    <select value={internetService} onChange={(e: any) => setInternetService(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="DSL">DSL copper line</option>
                      <option value="Fiber optic">Fiber optic gigabit</option>
                      <option value="No">No Internet Service</option>
                    </select>
                  </div>
                  {internetService !== 'No' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Online Security Protection</label>
                        <select value={onlineSecurity} onChange={(e: any) => setOnlineSecurity(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                          <option value="No">Inactive</option>
                          <option value="Yes">Active</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Online Cloud Backup</label>
                        <select value={onlineBackup} onChange={(e: any) => setOnlineBackup(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                          <option value="No">Inactive</option>
                          <option value="Yes">Active</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Device Protection Cover</label>
                        <select value={deviceProtection} onChange={(e: any) => setDeviceProtection(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                          <option value="No">Inactive</option>
                          <option value="Yes">Active</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Premium Tech Support Access</label>
                        <select value={techSupport} onChange={(e: any) => setTechSupport(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                          <option value="No">Inactive</option>
                          <option value="Yes">Active</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 4: Billing Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider">IV. Billing Rates & Contract Commitments</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Contract Commitment Level</label>
                    <select value={contract} onChange={(e: any) => setContract(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="Month-to-month">Month-to-month</option>
                      <option value="One year">One year lock-in</option>
                      <option value="Two year">Two year loyalty block</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Paperless Billing Enabled</label>
                    <select value={paperlessBilling} onChange={(e: any) => setPaperlessBilling(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Billing Payment Mechanism</label>
                    <select value={paymentMethod} onChange={(e: any) => setPaymentMethod(e.target.value)} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-700">
                      <option value="Electronic check">Electronic Check (Manual)</option>
                      <option value="Mailed check">Mailed Check (Manual)</option>
                      <option value="Bank transfer (automatic)">Bank Transfer (Automatic)</option>
                      <option value="Credit card (automatic)">Credit Card (Automatic)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Monthly Charge ($ Rate)</label>
                    <input type="number" step="0.01" required value={monthlyCharges} onChange={(e) => {
                      const mc = Number(e.target.value);
                      setMonthlyCharges(mc);
                      setTotalCharges(Number((mc * (tenure || 1)).toFixed(2)));
                    }} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Total Charges Cumulative ($)</label>
                    <input type="number" step="0.01" required value={totalCharges} onChange={(e) => setTotalCharges(Number(e.target.value))} className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium text-slate-800" />
                  </div>
                </div>
              </div>
            </form>

            {/* Footer buttons */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all">
                {editingCustomerId ? 'Apply System Updates' : 'Authorize Provisioning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
