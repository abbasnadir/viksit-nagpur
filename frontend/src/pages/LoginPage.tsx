import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, LogIn, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/appStore';

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter your credentials.');
      return;
    }

    setLoading(true);
    // Simulate auth delay
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);

    // Accept any credentials for demo
    if (username.length >= 3 && password.length >= 4) {
      login();
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0d1530 0%, #1e3068 100%)' }}
    >
      {/* Top government bar */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-center gap-4 py-2 px-4 text-xs text-white"
        style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span>Government of Maharashtra</span>
        <span>·</span>
        <span>Nagpur Traffic Police</span>
        <span>·</span>
        <span>Smart City Mission</span>
      </div>

      <div className="w-full max-w-sm mt-8">
        {/* Header card */}
        <div
          className="text-center mb-6 px-6"
        >
          {/* Emblem */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-amber-300 flex items-center justify-center shadow-lg">
              <Shield size={36} className="text-navy-900" style={{ color: '#0d1530' }} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">
            Viksit Nagpur
          </h1>
          <h2 className="text-sm text-blue-200 mt-1 leading-tight">
            Intelligent Traffic Management System
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Nagpur Traffic Police · Control Room Portal
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xl overflow-hidden">
          {/* Form header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 text-center">
            <div className="flex items-center justify-center gap-2">
              <Lock size={13} className="text-navy-700" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Authorized Personnel Only
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Officer ID / Username
              </label>
              <input
                type="text"
                id="username"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. NTP-2847 or inspector.sharma"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-slate-300 rounded px-3 py-2 pr-9 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                <AlertTriangle size={12} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:bg-slate-300 text-white text-sm font-semibold rounded transition-colors"
              style={{ backgroundColor: loading ? undefined : '#1e3068' }}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={14} />
              )}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <p className="text-center text-xs text-slate-400 mt-2">
              For access issues, contact your Zone Administrator or IT Helpdesk.
            </p>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-4 px-3 py-2 bg-amber-900/30 border border-amber-700/30 rounded text-center">
          <p className="text-xs text-amber-300">
            <strong>Demo:</strong> Enter any ID (≥3 chars) and password (≥4 chars) to proceed.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>Powered by MahaIT · Smart Cities Mission, Government of India</p>
          <p>© 2025 Nagpur Traffic Police. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
