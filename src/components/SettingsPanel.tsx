import React, { useState, useEffect } from 'react';
import { 
  Settings, Building, Sparkles, Key, Mail, ShieldAlert, Save, RefreshCw, EyeOff, Eye
} from 'lucide-react';
import { AppSettings, User } from '../types';
import { api } from '../lib/api';

interface SettingsPanelProps {
  currentUser: User | null;
  onRefreshUser: () => void;
}

export default function SettingsPanel({ currentUser, onRefreshUser }: SettingsPanelProps) {
  // States
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Change password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passError, setPassError] = useState(false);

  // Gemini API key settings fields
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestKey = async () => {
    if (!settings || !settings.geminiApiKey) return;
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await api.testGeminiApiKey(settings.geminiApiKey);
      setTestResult({ success: true, message: res.message });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Failed to validate API Key." });
    } finally {
      setTestingKey(false);
    }
  };

  // Load active settings
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Settings Changes
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setMsg(null);
    setIsError(false);

    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setMsg('Application parameters saved securely!');
    } catch (err: any) {
      setIsError(true);
      setMsg('Save failed: ' + err.message);
    }
  };

  // Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    setPassError(false);

    try {
      await api.changePassword(oldPassword, newPassword);
      setPassMsg('Password updated successfully! Keep your credentials safe.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassError(true);
      setPassMsg(err.message || 'Password update failed. Verify old credentials.');
    }
  };

  if (!settings) {
    return <div className="p-12 text-center text-slate-500 font-semibold">Configuring environment variables...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Configuration Settings</h2>
          <p className="text-slate-500 text-xs mt-0.5">Configure corporate details, AI models, and account credentials.</p>
        </div>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-xl text-xs font-bold font-mono text-center border ${
          isError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
        }`}>
          {msg}
        </div>
      )}

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Company details form */}
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2 border-b border-slate-50 pb-2">
              <Building className="w-4 h-4" />
              <span>Company Corporate Profile</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="sm:col-span-2">
                <label className="text-slate-500 uppercase">Organization name</label>
                <input 
                  type="text" 
                  value={settings.company.name} 
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, name: e.target.value }
                  })}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-800 transition-all" 
                />
              </div>
              <div>
                <label className="text-slate-500 uppercase">Support Email Address</label>
                <input 
                  type="email" 
                  value={settings.company.email} 
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, email: e.target.value }
                  })}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-800 transition-all" 
                />
              </div>
              <div>
                <label className="text-slate-500 uppercase">Corporate Hotline</label>
                <input 
                  type="text" 
                  value={settings.company.phone} 
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, phone: e.target.value }
                  })}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-800 transition-all" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-500 uppercase">HQ Physical Address</label>
                <input 
                  type="text" 
                  value={settings.company.address} 
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, address: e.target.value }
                  })}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-800 transition-all" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Parameters</span>
              </button>
            </div>
          </form>

          {/* AI Settings Form */}
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2 border-b border-slate-50 pb-2">
              <Sparkles className="w-4 h-4" />
              <span>Gemini AI Engine settings</span>
            </h4>

            <div className="text-xs font-medium space-y-4">
              <div>
                <label className="text-slate-500 font-bold uppercase block">Core Language Model</label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                  className="mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 font-semibold w-full sm:w-1/2"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Heavy analytical reasoning)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Default models require an active server-side key configured below or in AI Studio environment secrets.</p>
              </div>

              {/* Gemini API Key Management */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <label className="text-slate-500 font-bold uppercase block text-[11px] tracking-wider">Gemini API Access Key</label>
                  <div className="flex gap-2 mt-1.5">
                    <div className="relative flex-1">
                      <input 
                        type={showApiKey ? "text" : "password"} 
                        placeholder={settings.geminiApiKey ? "•••••••••••• (Saved)" : "Enter your Gemini API Key..."} 
                        value={settings.geminiApiKey || ''} 
                        onChange={(e) => setSettings({
                          ...settings,
                          geminiApiKey: e.target.value
                        })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-4 pr-10 py-2.5 outline-none font-mono text-xs text-slate-800 transition-all" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={testingKey || !settings.geminiApiKey}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer border border-slate-200"
                    >
                      {testingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                      <span>Test Key</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2.5">
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      Get Gemini API Key from Google AI Studio ↗
                    </a>
                    <span className="text-[9px] text-slate-400 font-medium">Your key is stored securely in db.json & never shared.</span>
                  </div>
                </div>

                {testResult && (
                  <div className={`p-3 rounded-xl text-[11px] font-semibold border ${
                    testResult.success 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    <p className="font-bold flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${testResult.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {testResult.success ? 'Success' : 'Validation Error'}
                    </p>
                    <p className="mt-0.5 leading-relaxed font-mono text-[10px]">{testResult.message}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Durable Risk Email Alerts</span>
                  <p className="text-[10px] text-slate-400">Trigger automatic CRM alerts if Churn probability crosses critical limits (≥70%)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, emailAlertsEnabled: !settings.emailAlertsEnabled })}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                    settings.emailAlertsEnabled 
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {settings.emailAlertsEnabled ? 'Alerts Enabled' : 'Alerts Blocked'}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save AI Configuration</span>
              </button>
            </div>
          </form>
        </div>

        {/* Password change form Column */}
        <div className="space-y-6">
          <form onSubmit={handleChangePasswordSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2 border-b border-slate-50 pb-2">
                <Key className="w-4 h-4" />
                <span>Account Password</span>
              </h4>

              <div className="text-xs font-semibold space-y-3.5">
                <div>
                  <label className="text-slate-500 uppercase">Old Password</label>
                  <input 
                    type="password" 
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2 outline-none font-medium text-slate-800" 
                  />
                </div>
                <div>
                  <label className="text-slate-500 uppercase">New Secure Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2 outline-none font-medium text-slate-800" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {passMsg && (
                <p className={`text-[10px] font-mono font-bold text-center p-2 rounded-lg ${
                  passError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {passMsg}
                </p>
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wide transition-all"
              >
                <span>Change Credentials</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
