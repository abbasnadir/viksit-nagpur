import React, { useState } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  X,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  CheckCircle,
  Sliders,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../store/appStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function OperatorProfileModal({ isOpen, onClose }: Props) {
  const { state, logout } = useApp();

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Modal Container with Login Page Theme: Navy Gradient & White Card */}
      <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-navy-700">
        {/* Navy Header with Yellow Shield Emblem */}
        <div
          className="p-5 text-center relative"
          style={{ background: 'linear-gradient(135deg, #0d1530 0%, #1e3068 100%)' }}
        >
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 text-slate-300 hover:text-white p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>

          {/* Golden/Yellow Emblem */}
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-amber-400 border-3 border-amber-300 flex items-center justify-center shadow-md">
              <Shield size={26} className="text-navy-900" style={{ color: '#0d1530' }} />
            </div>
          </div>

          <h2 className="text-base font-bold text-white leading-tight">
            N-TIR · Nagpur Traffic Police
          </h2>
          <p className="text-xs text-blue-200 mt-0.5 font-medium">
            Nagpur Traffic Intelligence & Response System · Console
          </p>
        </div>

        {/* White Main Card Section */}
        <div className="bg-white">
          {/* Subheader */}
          <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Lock size={12} className="text-navy-700" />
              Operator Details & Console Settings
            </div>
            <span className="text-[10px] font-mono text-slate-400">DESK-ID: CR-04</span>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Operator Info Grid */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                <UserCheck size={13} className="text-navy-700" />
                Active Personnel
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/70">
                  <span className="text-xs text-slate-500">Operator Name</span>
                  <span className="text-xs font-bold text-slate-800">{state.operatorName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/70">
                  <span className="text-xs text-slate-500">Officer Badge</span>
                  <span className="font-mono text-xs font-bold text-navy-800 bg-navy-50 border border-navy-200 px-2 py-0.5 rounded">
                    NTP-HQ-2847
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/70">
                  <span className="text-xs text-slate-500">Assigned Zone</span>
                  <span className="text-xs font-medium text-slate-700">Central Command & Sitabuldi HQ</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/70">
                  <span className="text-xs text-slate-500">Active Shift</span>
                  <span className="font-mono text-xs font-medium text-slate-700">06:00 – 14:00 (Day Operational)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Security Clearance</span>
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                    <CheckCircle size={11} /> Level-4 Controller Access
                  </span>
                </div>
              </div>
            </div>

            {/* Control Room Console Preferences */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                <Sliders size={13} className="text-navy-700" />
                Console Preferences
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {soundAlerts ? <Volume2 size={14} className="text-navy-700" /> : <VolumeX size={14} className="text-slate-400" />}
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Critical Incident Audio Alerts</div>
                      <div className="text-[10px] text-slate-500">Sound siren on high severity accidents</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      soundAlerts ? 'bg-navy-800' : 'bg-slate-300'
                    }`}
                    style={soundAlerts ? { backgroundColor: '#1e3068' } : {}}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                        soundAlerts ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-navy-700" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Radar & Map Live Auto-Sync</div>
                      <div className="text-[10px] text-slate-500">Poll traffic telemetry every 10 seconds</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      autoRefresh ? 'bg-navy-800' : 'bg-slate-300'
                    }`}
                    style={autoRefresh ? { backgroundColor: '#1e3068' } : {}}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                        autoRefresh ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-navy-700" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">High-Contrast Map Markers</div>
                      <div className="text-[10px] text-slate-500">Enhanced visibility for control room displays</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      highContrast ? 'bg-navy-800' : 'bg-slate-300'
                    }`}
                    style={highContrast ? { backgroundColor: '#1e3068' } : {}}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                        highContrast ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Logout section */}
            {showLogoutConfirm ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-red-800">Confirm Sign Out?</p>
                <p className="text-xs text-red-700">
                  You will be logged out of the control console and returned to the security portal.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      logout();
                    }}
                    className="flex-1 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded transition-colors"
                  >
                    Yes, Sign Out
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            {!showLogoutConfirm && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
              >
                <LogOut size={13} />
                <span>Sign Out / End Shift</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-4 py-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold rounded transition-colors"
              style={{ backgroundColor: '#1e3068' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
