import React, { useEffect } from 'react';
import { X, Building, Briefcase, MapPin, Calendar, Edit3, Trash2, ExternalLink } from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from '../common/StatusBadge';
import InterviewList from '../interviews/InterviewList';

const ALL_STATUSES = ['APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED'];

export default function JobDetailDrawer({
  isOpen,
  onClose,
  job,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Application Details
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                ID: {job.id?.slice(-6)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(job)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Edit Application"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(job.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete Application"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Company & Role Info */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {job.role}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <Building className="w-4 h-4 text-zinc-400" />
                    <span>{job.company}</span>
                  </div>
                </div>

                <StatusBadge status={job.status} size="sm" />
              </div>

              {/* Metadata chips */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Applied: {job.appliedDate || 'Not specified'}</span>
                </div>
              </div>

              {/* Status Quick Updater */}
              <div className="pt-2">
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Update Stage
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {ALL_STATUSES.map((statusKey) => {
                    const isCurrent = job.status === statusKey;
                    const conf = STATUS_CONFIG[statusKey];
                    return (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => onStatusChange(job.id, statusKey)}
                        className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border text-center transition-all ${
                          isCurrent
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {conf?.label || statusKey}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Online Assessment (OA) Details Card if present or status is ONLINE_ASSESSMENT */}
            {(job.status === 'ONLINE_ASSESSMENT' || job.oaEventDate || job.oaNotes) && (
              <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Online Assessment (OA) Stage
                    </h3>
                  </div>
                  {job.oaPlatform && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                      {job.oaPlatform}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-amber-100 dark:border-amber-900/40">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">OA Scheduled Event</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {job.oaEventDate ? new Date(job.oaEventDate).toLocaleString() : 'Not set yet'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-amber-100 dark:border-amber-900/40">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Configured Reminders</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {job.oaReminders && job.oaReminders.length > 0 ? (
                        job.oaReminders.map((r) => (
                          <span key={r} className="px-1.5 py-0.2 text-[10px] font-medium rounded bg-amber-200/60 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200">
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-400 text-[11px]">None</span>
                      )}
                    </div>
                  </div>
                </div>

                {job.oaNotes && (
                  <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-1">
                      📝 OA Notes & Mistakes Review
                    </div>
                    <p className="text-xs text-amber-950 dark:text-amber-100 whitespace-pre-wrap leading-relaxed">
                      {job.oaNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Interviews Management Section */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <InterviewList jobId={job.id} jobTitle={`${job.role} @ ${job.company}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
