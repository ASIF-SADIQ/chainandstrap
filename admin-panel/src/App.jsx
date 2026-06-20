import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';
import Dashboard from './Dashboard';
import AdminAuth from './AdminAuth';

const API_BASE = "http://137.184.102.82:5000/api/settings";

function App() {
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  const [tokens, setTokens] = useState(Array(7).fill(""));
  const [boardIds, setBoardIds] = useState(Array(7).fill(""));
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    try {
      // Backend schema expects: access_token and board_id
      const accounts = tokens.map((t, i) => ({ 
        username: `Account ${i+1}`,
        access_token: t, 
        board_id: boardIds[i] 
      }));
      await axios.post(API_BASE, { accounts });
      setMessage("✅ Settings Saved Successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Error saving settings");
    }
  };

  if (showFullDashboard) {
    return (
      <AdminAuth>
        <div className="bg-gray-100 min-h-screen">
          <button onClick={() => setShowFullDashboard(false)} className="m-4 flex items-center text-blue-600 hover:text-blue-800 font-bold">
            <ArrowLeft className="mr-2" /> Back to Token Setup
          </button>
          <Dashboard />
        </div>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
    <div className="min-h-screen bg-slate-900 text-white p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Anti-Gravity Control Center
          </h1>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowFullDashboard(true)} className="text-sm font-bold text-blue-400 hover:underline">
              Go to Full Dashboard ➔
            </button>
            <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/50">
              <Activity size={18} className="text-green-500 animate-pulse" />
              <span className="text-green-500 text-sm font-bold">Bot Online</span>
            </div>
          </div>
        </div>

        {message && <div className="mb-6 p-4 bg-blue-600 rounded-lg text-center font-bold">{message}</div>}

        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <ShieldCheck className="mr-2 text-blue-400" /> Pinterest Multi-Account Rotation (7 Tokens)
          </h2>
          
          <div className="space-y-4">
            {tokens.map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Account {i + 1} Access Token</label>
                  <input 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    value={tokens[i]} 
                    onChange={(e) => {
                      const newT = [...tokens]; newT[i] = e.target.value; setTokens(newT);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Board ID {i + 1}</label>
                  <input 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    value={boardIds[i]} 
                    onChange={(e) => {
                      const newB = [...boardIds]; newB[i] = e.target.value; setBoardIds(newB);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleSave}
            className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition"
          >
            <Save className="mr-2" /> Activate Anti-Gravity Rotation
          </button>
        </div>
      </div>
    </div>
    </AdminAuth>
  );
}

export default App;
