import React, { useState, useRef } from 'react';
import { MessageSquare, Upload, CheckCircle, X } from 'lucide-react';

const INCIDENT_TYPES = [
  'Accident',
  'Road Blockage',
  'Signal Failure',
  'Road Damage',
  'Road Closure',
  'Flooding',
  'Illegal Parking',
  'Crowd / Gathering',
  'Other',
];

const NAGPUR_LOCATIONS = [
  'Variety Square, Sitabuldi',
  'RBI Square (Samvidhan Chowk)',
  'Law College Square, Dharampeth',
  'Shankar Nagar Square',
  'Chhatrapati Square, Pratap Nagar',
  'Rahate Colony Square',
  'Ajni Square',
  'Medical Square, GMCH Area',
  'Telephone Exchange Square, CA Road',
  'Automotive Square, Kamptee Road',
  'Itwari Railway Station',
  'Airport Road Junction',
  'Gandhibagh Square',
  'Zero Mile, Central Nagpur',
  'Dharampeth Square',
  'Other (Describe in details)',
];

interface FormData {
  type: string;
  location: string;
  customLocation: string;
  description: string;
  contactPhone: string;
  imageFile: File | null;
}

export default function CitizenReportsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>({
    type: '',
    location: '',
    customLocation: '',
    description: '',
    contactPhone: '',
    imageFile: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.type) e.type = 'Please select an incident type.';
    if (!form.location) e.location = 'Please select a location.';
    if (!form.description || form.description.length < 10)
      e.description = 'Please enter a description (min 10 characters).';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs as Partial<FormData>);
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ type: '', location: '', customLocation: '', description: '', contactPhone: '', imageFile: null });
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="card max-w-md w-full p-8 text-center">
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Report Submitted</h2>
          <p className="text-sm text-slate-500 mb-2">
            Your report has been received by Nagpur Traffic Police Control Room.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-left mb-4">
            <p className="text-xs text-slate-500 mb-1">Reference ID</p>
            <p className="font-mono text-sm font-bold text-slate-800">
              NTP-CR-{Date.now().toString().slice(-8)}
            </p>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            A response team has been notified. For urgent emergencies, please call <strong>100</strong>.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-navy-800 text-white text-sm font-semibold rounded transition-colors hover:bg-navy-900"
            style={{ backgroundColor: '#1e3068' }}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare size={15} className="text-navy-700" />
          Citizen Incident Report
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Report traffic incidents, road damage, signal failures and other civic issues to Nagpur Traffic Police.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl">
          {/* Emergency notice */}
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-start gap-2">
            <span className="text-red-600 font-bold text-sm">⚠</span>
            <div>
              <p className="text-xs font-bold text-red-800">For life-threatening emergencies, call 100 immediately.</p>
              <p className="text-xs text-red-700 mt-0.5">
                This form is for non-emergency reporting only. Reports are reviewed during operational hours.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-4 space-y-4">
            {/* Incident Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Incident Type <span className="text-red-600">*</span>
              </label>
              <select
                className={`w-full border rounded px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-navy-600
                  ${errors.type ? 'border-red-400' : 'border-slate-300'}`}
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="">— Select incident type —</option>
                {INCIDENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-600 mt-0.5">{errors.type}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Location <span className="text-red-600">*</span>
              </label>
              <select
                className={`w-full border rounded px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-navy-600
                  ${errors.location ? 'border-red-400' : 'border-slate-300'}`}
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              >
                <option value="">— Select nearest landmark —</option>
                {NAGPUR_LOCATIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.location && <p className="text-xs text-red-600 mt-0.5">{errors.location}</p>}
            </div>

            {/* Custom location if Other */}
            {form.location.startsWith('Other') && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Specify Location
                </label>
                <input
                  type="text"
                  placeholder="Enter street name, area, or landmark"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-navy-600"
                  value={form.customLocation}
                  onChange={e => setForm(f => ({ ...f, customLocation: e.target.value }))}
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                className={`w-full border rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-navy-600 resize-none
                  ${errors.description ? 'border-red-400' : 'border-slate-300'}`}
                rows={4}
                placeholder="Describe the incident in detail: what happened, how many vehicles involved, any injuries, which lanes are blocked, etc."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className="flex justify-between">
                {errors.description && <p className="text-xs text-red-600 mt-0.5">{errors.description}</p>}
                <span className="text-xs text-slate-400 ml-auto mt-0.5">{form.description.length} chars</span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Contact Phone (optional)
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-navy-600"
                value={form.contactPhone}
                onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                maxLength={10}
              />
              <p className="text-xs text-slate-400 mt-0.5">
                Optional. We may contact you for follow-up. Not published publicly.
              </p>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Attach Image / Video (optional)
              </label>
              <div
                className="border-2 border-dashed border-slate-300 rounded p-4 text-center cursor-pointer hover:border-slate-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={e => setForm(f => ({ ...f, imageFile: e.target.files?.[0] ?? null }))}
                />
                {form.imageFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                    <CheckCircle size={14} />
                    <span>{form.imageFile.name}</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, imageFile: null })); }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <Upload size={20} className="mx-auto mb-1" />
                    <p className="text-xs">Click to upload photo or video</p>
                    <p className="text-xs mt-0.5">JPG, PNG, MP4 (max 20 MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-navy-800 hover:bg-navy-900 text-white text-sm font-semibold rounded transition-colors"
                style={{ backgroundColor: '#1e3068' }}
              >
                Submit Report
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded transition-colors"
              >
                Reset
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Reports are reviewed by Nagpur Traffic Police Control Room.
              False or malicious reports are a punishable offence.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
