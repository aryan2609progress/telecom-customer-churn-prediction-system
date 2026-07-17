import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, 
  HelpCircle, ChevronRight, ArrowDownRight, ArrowUpRight, DollarSign, Calendar, Clock, RefreshCw, AlertOctagon
} from 'lucide-react';
import { Customer, Prediction, AIReport } from '../types';
import { api } from '../lib/api';

interface PredictionModuleProps {
  customer: Customer;
  onRefreshCustomer: () => void;
}

export default function PredictionModule({ customer, onRefreshCustomer }: PredictionModuleProps) {
  // States
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [aiReports, setAiReports] = useState<AIReport[]>([]);
  
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [errorPredict, setErrorPredict] = useState<string | null>(null);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  // Load Prediction and AI report history
  const loadHistory = async () => {
    try {
      const preds = await api.getPredictionHistory(customer.id);
      setPredictions(preds);
      const reports = await api.getAiReports(customer.id);
      setAiReports(reports);
    } catch (err: any) {
      console.error("Error loading historical feeds:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [customer.id]);

  // Trigger real prediction computation
  const handleRunPredict = async () => {
    setLoadingPredict(true);
    setErrorPredict(null);
    try {
      await api.runPredict(customer.id);
      await loadHistory();
      onRefreshCustomer(); // Updates parent container state
    } catch (err: any) {
      setErrorPredict(err.message || 'Model execution failed');
    } finally {
      setLoadingPredict(false);
    }
  };

  // Trigger Gemini AI insights generation
  const handleRunAI = async () => {
    setLoadingAI(true);
    setErrorAI(null);
    try {
      await api.runAiInsights(customer.id);
      await loadHistory();
    } catch (err: any) {
      setErrorAI(err.message || 'Gemini core service failed');
    } finally {
      setLoadingAI(false);
    }
  };

  const latestPrediction = predictions[0];
  const latestAIReport = aiReports[0];

  // Helper colors for risk
  const getRiskColor = (prob: number) => {
    if (prob >= 70) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', fill: '#EF4444' };
    if (prob >= 40) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', fill: '#F59E0B' };
    return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', fill: '#10B981' };
  };

  const rc = getRiskColor(customer.churnProbability);

  return (
    <div className="space-y-6">
      {/* ML Prediction Controller Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge & Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">Churn Model Diagnostics</h4>
            <p className="text-slate-500 text-xs mt-0.5">Statistical XGBoost Churn Classifier</p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center relative">
            {/* SVG Circle Gauge */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                {/* Active Indicator */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke={rc.fill} 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - customer.churnProbability / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner score overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{customer.churnProbability}%</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-0.5">Risk Index</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${rc.bg} ${rc.text} border ${rc.border}`}>
                {customer.churnProbability >= 70 ? (
                  <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                ) : customer.churnProbability >= 40 ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{customer.riskLevel} Churn Risk</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleRunPredict}
            disabled={loadingPredict}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wide transition-all"
          >
            {loadingPredict ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Co-efficients...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>Execute Prediction Model</span>
              </>
            )}
          </button>
          {errorPredict && <p className="text-rose-500 text-xs mt-2 text-center font-semibold">{errorPredict}</p>}
        </div>

        {/* Prediction explanation details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between lg:col-span-2">
          {latestPrediction ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Active Model Assessment Output</h4>
                  <p className="text-slate-400 text-[10px] font-mono">ID: {latestPrediction.id} • Conf: {latestPrediction.confidenceScore}%</p>
                </div>
                <span className="text-xs font-mono text-slate-500">{new Date(latestPrediction.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs leading-relaxed font-medium">
                {latestPrediction.explanation}
              </div>

              {/* Factors column split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk factors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-rose-500 uppercase font-mono tracking-widest flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Top Risk Factors</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {latestPrediction.riskFactors.map((factor, i) => (
                      <li key={i} className="flex gap-2 items-start bg-rose-50/40 p-2 rounded-lg border border-rose-100/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                        <span className="font-medium">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Positive factors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase font-mono tracking-widest flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Positive Retaining Drivers</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {latestPrediction.positiveFactors.map((factor, i) => (
                      <li key={i} className="flex gap-2 items-start bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                        <span className="font-medium">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <BrainCircuit className="w-14 h-14 text-slate-300 mb-3 animate-pulse" />
              <h5 className="font-bold text-slate-800">No Prediction Calculations Found</h5>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Run Churn prediction model to compute high-risk probability vectors and diagnostics based on customer contracts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Gemini Churn AI Insights Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Gemini Retention Brainstorming Engine</h4>
              <p className="text-slate-500 text-xs">Custom retention strategies & plan incentives generated in real-time</p>
            </div>
          </div>

          <button
            onClick={handleRunAI}
            disabled={loadingAI}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-indigo-600/10 tracking-wide transition-all"
          >
            {loadingAI ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini Analyzing Customer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Ask Gemini AI Retention Strategy</span>
              </>
            )}
          </button>
        </div>

        {errorAI && <p className="text-rose-500 text-xs text-center font-semibold">{errorAI}</p>}

        {loadingAI ? (
          <div className="space-y-4 animate-pulse p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs text-slate-500 font-semibold font-mono tracking-widest uppercase">Consulting Gemini Neural Network...</span>
            </div>
            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          </div>
        ) : latestAIReport ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in font-sans">
            {/* Executive summary & churn reason */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest block">I. Executive Summary Analysis</span>
                <p className="text-slate-700 text-sm font-medium leading-relaxed mt-1.5">{latestAIReport.executiveSummary}</p>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest block">II. Gemini Risk Diagnosis</span>
                <p className="text-slate-600 text-xs leading-relaxed font-medium mt-1.5">{latestAIReport.riskAnalysis}</p>
              </div>

              {/* Retention strategies bulleted lists */}
              <div className="pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-indigo-500 uppercase font-mono tracking-widest block">III. Step-by-Step Retention Campaigns</span>
                <div className="mt-2.5 space-y-2.5">
                  {latestAIReport.retentionStrategies.map((strat, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50">
                      <div className="w-5 h-5 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 text-xs font-semibold leading-normal">{strat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Loyalty package proposal & Next action */}
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col justify-between space-y-6">
              {/* Proposal Discount */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-widest block">Proposed Loyalty Discount</span>
                <div className="flex gap-3 items-start bg-white border border-slate-150 p-4 rounded-xl shadow-sm">
                  <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Concession Proposal</h5>
                    <p className="text-slate-600 text-xs leading-normal mt-0.5 font-semibold">{latestAIReport.discountSuggestion}</p>
                  </div>
                </div>
              </div>

              {/* Next Best Action */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-600 uppercase font-mono tracking-widest block">Immediate Retention Action</span>
                <div className="flex gap-3 items-start bg-amber-50/50 border border-amber-100 p-4 rounded-xl shadow-sm">
                  <div className="p-2.5 bg-amber-100/80 rounded-lg text-amber-700">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Next Best Action</h5>
                    <p className="text-slate-700 text-xs leading-normal mt-0.5 font-bold">{latestAIReport.nextBestAction}</p>
                  </div>
                </div>
              </div>

              {/* Audit timestamp footer */}
              <div className="text-[10px] text-slate-400 font-mono text-center pt-4 border-t border-slate-200">
                Generated: {new Date(latestAIReport.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BrainCircuit className="w-12 h-12 text-indigo-200 animate-pulse mb-2" />
            <h5 className="font-bold text-slate-800">No Gemini Churn Analysis Active</h5>
            <p className="text-xs text-slate-400 max-w-sm mt-1">Initialize the Gemini Brainstorming Engine to generate a highly customized retention package and specific next best action lists.</p>
          </div>
        )}
      </div>
    </div>
  );
}
