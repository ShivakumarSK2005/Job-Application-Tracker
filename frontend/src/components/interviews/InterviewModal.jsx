import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Calendar, User, Video, Bell, CheckCircle2, Loader2, Link2, Clock, Layers } from 'lucide-react';

const CATEGORIES = ['Technical', 'HR', 'Screening', 'Others'];

const CATEGORY_SUGGESTIONS = {
  Technical: ['Technical DSA', 'System Design', 'Live Coding Round', 'Take-Home Project Review'],
  HR: ['HR / Culture Fit', 'Behavioral & Leadership', 'Salary & Offer Discussion'],
  Screening: ['Recruiter Phone Screening', 'Initial Technical Screen'],
  Others: ['Hiring Manager Discussion', 'Executive / Panel Interview', 'Product Walkthrough'],
};

const COMMON_TYPES = ['Online (Google Meet)', 'Online (Zoom)', 'Online (Teams)', 'Phone Screen', 'In-Person / Onsite'];
const RESULTS = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED'];

const REMINDER_OPTIONS = [
  { id: '30m', label: '30 mins before' },
  { id: '1h', label: '1 hour before' },
  { id: '1d', label: '1 day before' },
  { id: '2d', label: '2 days before' },
  { id: '3d', label: '3 days before' },
  { id: '1w', label: '1 week before' },
];

export default function InterviewModal({
  isOpen,
  onClose,
  onSubmit,
  jobTitle,
  initialData = null,
  isLoading = false,
}) {
  const isEditing = Boolean(initialData);
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    interviewDate: getTodayString(),
    interviewTime: '10:00',
    roundCategory: 'Technical',
    round: 'Technical DSA',
    type: 'Online (Google Meet)',
    interviewer: '',
    result: 'PENDING',
    notes: '',
    meetingLink: '',
    reminders: ['1d', '1h'],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        interviewDate: initialData.interviewDate || getTodayString(),
        interviewTime: initialData.interviewTime || '10:00',
        roundCategory: initialData.roundCategory || 'Technical',
        round: initialData.round || 'Technical DSA',
        type: initialData.type || 'Online (Google Meet)',
        interviewer: initialData.interviewer || '',
        result: initialData.result || 'PENDING',
        notes: initialData.notes || '',
        meetingLink: initialData.meetingLink || '',
        reminders: initialData.reminders || ['1d', '1h'],
      });
    } else {
      setFormData({
        interviewDate: getTodayString(),
        interviewTime: '10:00',
        roundCategory: 'Technical',
        round: 'Technical DSA',
        type: 'Online (Google Meet)',
        interviewer: '',
        result: 'PENDING',
        notes: '',
        meetingLink: '',
        reminders: ['1d', '1h'],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleCategoryChange = (category) => {
    const suggestions = CATEGORY_SUGGESTIONS[category] || [];
    setFormData((prev) => ({
      ...prev,
      roundCategory: category,
      round: suggestions[0] || prev.round,
    }));
  };

  const toggleReminder = (tag) => {
    setFormData((prev) => {
      const exists = prev.reminders?.includes(tag);
      const updated = exists
        ? prev.reminders.filter((t) => t !== tag)
        : [...(prev.reminders || []), tag];
      return { ...prev, reminders: updated };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.interviewDate) {
      errs.interviewDate = 'Date is required';
    } else {
      const today = getTodayString();
      if (formData.interviewDate < today) {
        errs.interviewDate = 'Interview date cannot be in the past';
      } else if (formData.interviewDate === today && formData.interviewTime) {
        const [h, m] = formData.interviewTime.split(':').map(Number);
        const now = new Date();
        if (h < now.getHours() || (h === now.getHours() && m < now.getMinutes())) {
          errs.interviewTime = 'Interview time cannot be in the past for today';
        }
      }
    }

    if (!formData.interviewTime) {
      errs.interviewTime = 'Time is required';
    }
    if (!formData.round.trim()) errs.round = 'Round description is required';
    if (!formData.type.trim()) errs.type = 'Interview type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update Interview Round' : 'Schedule Interview Round'}
      description={`Linked to: ${jobTitle || 'Application'}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Round Category Selection (Technical, HR, Screening, Others) */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Round Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = formData.roundCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Round Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Round Name / Topic <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            list="rounds-list"
            value={formData.round}
            onChange={(e) => setFormData({ ...formData, round: e.target.value })}
            placeholder="e.g. Technical Round 1 or System Design"
            className={`w-full px-3 py-2 text-xs rounded-xl border ${
              errors.round
                ? 'border-rose-500'
                : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
            } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2`}
          />
          <datalist id="rounds-list">
            {(CATEGORY_SUGGESTIONS[formData.roundCategory] || []).map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
          {errors.round && <p className="text-[11px] text-rose-500 mt-1">{errors.round}</p>}
        </div>

        {/* Date & Time (Both required as requested!) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Interview Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                  errors.interviewDate
                    ? 'border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.interviewDate && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.interviewDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Interview Timing <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                value={formData.interviewTime}
                onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                  errors.interviewTime
                    ? 'border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.interviewTime && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.interviewTime}</p>
            )}
          </div>
        </div>

        {/* Medium / Type & Interviewer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Medium / Platform <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="types-list"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <datalist id="types-list">
              {COMMON_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Interviewer Name / Role
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Sarah (Senior Eng)"
                value={formData.interviewer}
                onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Meeting URL */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Meeting URL / Video Link
          </label>
          <div className="relative">
            <Link2 className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. meet.google.com/xyz or zoom.us/j/..."
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Outcome Result if editing */}
        {isEditing && (
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Round Outcome
            </label>
            <select
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {RESULTS.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reminder notification toggles */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bell className="w-3.5 h-3.5 text-indigo-500" />
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Notification Alarms (Email & Browser Web Push)
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REMINDER_OPTIONS.map((opt) => {
              const isChecked = formData.reminders?.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleReminder(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
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

        {/* Notes / Learnings */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Round Preparation Notes & Focus Topics (Optional)
            </label>
          </div>
          <textarea
            rows={2}
            placeholder="Key concepts to review, questions to ask the interviewer, or notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

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
            {isEditing ? 'Update Round' : 'Schedule Round'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
