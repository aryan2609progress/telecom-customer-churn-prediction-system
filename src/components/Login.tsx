import React, { useState } from 'react';
import { 
  Key, Mail, User, ShieldAlert, Sparkles, LogIn, ChevronRight, HelpCircle, Activity
} from 'lucide-react';
import { api } from '../lib/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // States
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'employee'>('employee');

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  // General log/msg
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick fill logins
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isLoginTab) {
        const user = await api.login(username, password);
        localStorage.setItem('telecom_user', JSON.stringify(user));
        onLoginSuccess(user);
      } else {
        const user = await api.signup({ username, password, name, email, role });
        setIsLoginTab(true);
        setUsername(username);
        setPassword(password);
        setErrorMsg('Sign up successful! Please enter your password to log in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    try {
      const msg = await api.forgotPassword(forgotEmail);
      setForgotMsg(msg);
    } catch (err: any) {
      setForgotMsg(err.message || 'No account matched this email');
    }
  };

  return (
    <div className="min-screen w-full bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative space-y-6">
        
        {/* Upper Brand Info */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">TeleConnect Intelligence</h1>
            <p className="text-slate-400 text-xs font-semibold">Telecom Subscriber Churn Prediction System</p>
          </div>
        </div>

        {/* Forgot password card wrapper */}
        {showForgot ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-white mb-2">Simulate Credentials Recovery</h3>
            <div>
              <label className="text-slate-400 uppercase">Registered Email</label>
              <input 
                type="email" 
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="registered@teleconnect.com"
                className="w-full mt-1.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-white font-medium"
              />
            </div>

            {forgotMsg && (
              <p className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 p-3 rounded-lg leading-relaxed">
                {forgotMsg}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotMsg(null); }}
                className="flex-1 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-all"
              >
                Return to Login
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
              >
                Request reset link
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            {/* Tab selection */}
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-2">
              <button
                type="button"
                onClick={() => { setIsLoginTab(true); setErrorMsg(null); }}
                className={`py-2 rounded-lg font-bold text-xs transition-all ${
                  isLoginTab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginTab(false); setErrorMsg(null); }}
                className={`py-2 rounded-lg font-bold text-xs transition-all ${
                  !isLoginTab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* General Error Display */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[10px] rounded-lg font-bold">
                {errorMsg}
              </div>
            )}

            {/* Fields */}
            {!isLoginTab && (
              <>
                <div>
                  <label className="text-slate-400 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditya Birla"
                    className="w-full mt-1.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-400 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditya@teleconnect.com"
                    className="w-full mt-1.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-400 uppercase">Assign Operational Role</label>
                  <select 
                    value={role} 
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full mt-1.5 bg-slate-850 border border-slate-800 rounded-xl px-4 py-2.5 outline-none text-white"
                  >
                    <option value="employee">Employee (Outreach agent)</option>
                    <option value="manager">Manager (Auditor / Executive)</option>
                    <option value="admin">Administrator (Complete Access)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-slate-400 uppercase">Username ID</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, manager or employee..."
                className="w-full mt-1.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-white font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-slate-400 uppercase">Secure Password</label>
                {isLoginTab && (
                  <button 
                    type="button" 
                    onClick={() => setShowForgot(true)}
                    className="text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Recover Password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 outline-none text-white font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoginTab ? 'Authenticate Session' : 'Create System Credentials'}</span>
            </button>

            {/* Quick Fill Login Buttons */}
            {isLoginTab && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block text-center font-bold">Quick fill sandbox accounts:</span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin', 'password123')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2.5 py-1 rounded-md text-[10px] border border-slate-700 transition-all"
                  >
                    Admin Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('manager', 'password123')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2.5 py-1 rounded-md text-[10px] border border-slate-700 transition-all"
                  >
                    Manager Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('employee', 'password123')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2.5 py-1 rounded-md text-[10px] border border-slate-700 transition-all"
                  >
                    Employee Account
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
