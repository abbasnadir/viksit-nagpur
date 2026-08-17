import React, { useState } from 'react';
import { CheckCircle, X, Edit2 } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { PriorityBadge } from '../common/Badge';
import type { DeploymentAssignment } from '../../types';

interface Props {
  deployment: DeploymentAssignment;
}

export default function RecommendationCard({ deployment: dep }: Props) {
  const { state, approveDeployment, rejectDeployment } = useApp();
  const [showModify, setShowModify] = useState(false);

  const officer = state.officers.find(o => o.id === dep.officerId);

  if (dep.status === 'Approved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-green-800">Approved</span>
          </div>
          <PriorityBadge priority={dep.priority} />
        </div>
        <p className="text-xs text-green-700 mt-1">
          {dep.officerName} ({dep.officerBadge}) → {dep.toLocationName}
        </p>
      </div>
    );
  }

  if (dep.status === 'Rejected') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded p-3 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <X size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Rejected</span>
          </div>
          <PriorityBadge priority={dep.priority} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {dep.officerName} → {dep.toLocationName}
        </p>
      </div>
    );
  }

  if (dep.status === 'Modified') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">Modified & Approved</span>
          </div>
          <PriorityBadge priority={dep.priority} />
        </div>
        <p className="text-xs text-blue-700 mt-1">
          {dep.officerName} ({dep.officerBadge}) → {dep.toLocationName}
        </p>
        <p className="text-xs text-blue-600 mt-0.5 italic">{dep.reason}</p>
      </div>
    );
  }

  return (
    <div className="card border border-slate-200 rounded">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={dep.priority} />
          <span className="text-xs text-slate-500 font-mono">{dep.officerBadge}</span>
        </div>
        <span className="text-xs text-slate-400">ETA {dep.etaMinutes} min</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-2">
        {/* Officer → Location */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1">
            <div className="font-semibold text-slate-800">{dep.officerName}</div>
            <div className="text-slate-400 text-xs">
              {dep.fromLocationName ?? 'Unassigned'}
            </div>
          </div>
          <div className="text-slate-300">→</div>
          <div className="flex-1 text-right">
            <div className="font-semibold text-navy-800">{dep.toLocationName}</div>
            <div className="text-slate-400 text-xs">Destination</div>
          </div>
        </div>

        {/* Officer info */}
        {officer && (
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-2 py-1.5">
            {officer.rank} · {officer.zone} · Workload: {officer.workloadPct}%
          </div>
        )}

        {/* Reason */}
        <div className="text-xs text-slate-600 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
          <span className="font-semibold text-amber-700">AI Reason: </span>
          {dep.reason}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => approveDeployment(dep.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded transition-colors"
          >
            <CheckCircle size={11} />
            Approve
          </button>
          <button
            onClick={() => setShowModify(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded transition-colors"
          >
            <Edit2 size={11} />
            Modify
          </button>
          <button
            onClick={() => rejectDeployment(dep.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors"
          >
            <X size={11} />
            Reject
          </button>
        </div>
      </div>

      {/* Inline Modify Form */}
      {showModify && (
        <ModifyForm
          deployment={dep}
          onClose={() => setShowModify(false)}
        />
      )}
    </div>
  );
}

// ─── Inline Modify Form ───────────────────────────────────────────────────────

function ModifyForm({ deployment, onClose }: { deployment: DeploymentAssignment; onClose: () => void }) {
  const { state, modifyDeployment } = useApp();
  const [toLocationId, setToLocationId] = useState(deployment.toLocationId);
  const [reason, setReason] = useState(`[Operator Override] ${deployment.reason}`);

  const selectedLoc = state.locations.find(l => l.id === toLocationId);

  const handleConfirm = () => {
    if (selectedLoc) {
      modifyDeployment(deployment.id, toLocationId, selectedLoc.name, reason);
      onClose();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-blue-50 px-3 py-3 space-y-2">
      <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Operator Override</p>

      <div>
        <label className="block text-xs text-slate-600 mb-0.5">Reassign To</label>
        <select
          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white"
          value={toLocationId}
          onChange={e => setToLocationId(e.target.value)}
        >
          {state.locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name} (Risk: {loc.riskLevel})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-600 mb-0.5">Override Reason</label>
        <textarea
          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white resize-none"
          rows={2}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          className="flex-1 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded transition-colors"
        >
          Confirm Override
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
