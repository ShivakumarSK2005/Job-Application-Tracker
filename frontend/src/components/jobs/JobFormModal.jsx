import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Loader2, Building, Briefcase, MapPin, Calendar, Clock, Bell, Globe, CheckCircle2 } from 'lucide-react';

const STATUS_LIST = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'ONLINE_ASSESSMENT', label: 'Online Assessment' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
];

const REMINDER_OPTIONS = [
  { id: '30m', label: '30 mins before' },
  { id: '1h', label: '1 hour before' },
  { id: '1d', label: '1 day before' },
  { id: '2d', label: '2 days before' },
  { id: '3d', label: '3 days before' },
  { id: '1w', label: '1 week before' },
];

export default function JobFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const isEditing = Boolean(initialData);
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    status: 'APPLIED',
    appliedDate: getTodayString(),
    oaEventDate: '',
    oaPlatform: '',
    oaNotes: '',
    oaReminders: ['1d', '1h'],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        role: initialData.role || '',
        location: initialData.location || '',
        status: initialData.status || 'APPLIED',
        appliedDate: initialData.appliedDate || getTodayString(),
        oaEventDate: initialData.oaEventDate || '',
        oaPlatform: initialData.oaPlatform || '',
        oaNotes: initialData.oaNotes || '',
        oaReminders: initialData.oaReminders || ['1d', '1h'],
      });
    } else {
      setFormData({
        company: '',
        role: '',
        location: '',
        status: 'APPLIED',
        appliedDate: getTodayString(),
        oaEventDate: '',
        oaPlatform: '',
        oaNotes: '',
        oaReminders: ['1d', '1h'],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const toggleReminder = (tag) => {
    setFormData((prev) => {
      const exists = prev.oaReminders?.includes(tag);
      const updated = exists
        ? prev.oaReminders.filter((t) => t !== tag)
        : [...(prev.oaReminders || []), tag];
      return { ...prev, oaReminders: updated };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.length > 100) {
      newErrors.company = 'Cannot exceed 100 characters';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role / Title is required';
    } else if (formData.role.length > 100) {
      newErrors.role = 'Cannot exceed 100 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length > 100) {
      newErrors.location = 'Cannot exceed 100 characters';
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Application date is required';
    } else if (formData.appliedDate > getTodayString()) {
      newErrors.appliedDate = 'Applied date cannot be in the future (must be today or in the past)';
    }

    if (formData.status === 'ONLINE_ASSESSMENT') {
      if (!formData.oaEventDate) {
        newErrors.oaEventDate = 'OA Event Date & Time is required for Online Assessment stage';
      } else {
        const selectedTime = new Date(formData.oaEventDate).getTime();
        const now = Date.now() - 60000; // allow 1 minute buffer for form filling
        if (selectedTime < now) {
          newErrors.oaEventDate = 'OA Event Date & Time cannot be in the past (must be today or in the future)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const isOA = formData.status === 'ONLINE_ASSESSMENT';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Job Application' : 'Track New Application'}
      description={
        isEditing
          ? 'Update details, stage, and event scheduling for this application'
          : 'Log a new application and track your OA or Interview milestones'
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Google, Stripe, Microsoft"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                errors.company
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.company && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.company}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Job Role / Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Senior Backend Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                errors.role
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.role && <p className="text-[11px] text-rose-500 mt-1">{errors.role}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Location <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Remote, Bangalore, San Francisco"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                errors.location
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.location && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.location}</p>
          )}
        </div>

        {/* Stage & Applied Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Current Stage <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {STATUS_LIST.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Applied Date (Always required, past or today) */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Applied Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                max={getTodayString()}
                value={formData.appliedDate}
                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            {errors.appliedDate && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.appliedDate}</p>
            )}
          </div>
        </div>

        {/* DYNAMIC STAGE SECTION: ONLINE ASSESSMENT */}
        {isOA && (
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Clock className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Online Assessment (OA) Scheduling & Reminders
              </h4>
            </div>

            {/* OA Date & Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  OA Event Date & Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="datetime-local"
                    value={formData.oaEventDate}
                    onChange={(e) => setFormData({ ...formData, oaEventDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                {errors.oaEventDate && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.oaEventDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Platform / Test Link
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. HackerRank / Codility / URL"
                    value={formData.oaPlatform}
                    onChange={(e) => setFormData({ ...formData, oaPlatform: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Reminders multi-select */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Reminder Alarms (Email & Browser Web Push)
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REMINDER_OPTIONS.map((opt) => {
                  const isChecked = formData.oaReminders?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleReminder(opt.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
