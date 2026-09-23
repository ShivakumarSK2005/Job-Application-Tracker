import React from 'react';
import { Building, MapPin, Calendar, MoreVertical, Edit2, Trash2, ArrowRight, ArrowLeft, RotateCcw, BookOpen } from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from '../common/StatusBadge';

const ACTIVE_COLUMNS = [
  { id: 'APPLIED', title: 'Applied', color: 'bg-sky-500' },
  { id: 'ONLINE_ASSESSMENT', title: 'Online Assessment', color: 'bg-amber-500' },
  { id: 'INTERVIEW', title: 'Interview', color: 'bg-indigo-500' },
];

const PAST_COLUMNS = [
  { id: 'SELECTED', title: 'Selected / Offers', color: 'bg-emerald-500' },
  { id: 'REJECTED', title: 'Archived / Rejected', color: 'bg-rose-500' },
];

export default function JobBoard({
  jobs,
  loading,
  activeTab = 'active',
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onStatusChange,
  onOpenNotes,
}) {
  const columns = activeTab === 'active' ? ACTIVE_COLUMNS : PAST_COLUMNS;

  const getNextStatus = (current) => {
    switch (current) {
      case 'APPLIED':
        return 'ONLINE_ASSESSMENT';
      case 'ONLINE_ASSESSMENT':
        return 'INTERVIEW';
      case 'INTERVIEW':
        return 'SELECTED';
      default:
        return null;
    }
  };

  const getPrevStatus = (current) => {
    switch (current) {
      case 'ONLINE_ASSESSMENT':
        return 'APPLIED';
      case 'INTERVIEW':
        return 'ONLINE_ASSESSMENT';
      case 'SELECTED':
        return 'INTERVIEW';
      case 'REJECTED':
        return 'INTERVIEW';
      default:
        return null;
    }
  };

  return (
    <div
      className={`grid gap-4 items-start ${
        activeTab === 'active'
          ? 'grid-cols-1 md:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
      }`}
    >
      {columns.map((column) => {
        const columnJobs = jobs.filter((j) => j.status === column.id);

        return (
          <div
            key={column.id}
            className="flex flex-col bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3 min-h-[440px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {column.title}
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {columnJobs.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-28 bg-white dark:bg-zinc-900/70 rounded-xl animate-pulse" />
                  <div className="h-28 bg-white dark:bg-zinc-900/70 rounded-xl animate-pulse" />
                </div>
              ) : columnJobs.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 text-center p-3">
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {activeTab === 'active' ? 'No active applications' : 'No past applications'}
                  </p>
                </div>
              ) : (
                columnJobs.map((job) => {
                  const nextStatus = getNextStatus(job.status);
                  const prevStatus = getPrevStatus(job.status);

                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className="group relative p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      {/* Top Row: Company & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.role}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                            <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="font-medium truncate">{job.company}</span>
                          </div>
                        </div>

                        {/* Quick card action buttons */}
                        <div
                          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onEditJob(job)}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteJob(job.id)}
                            className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Location & Date */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 shrink-0 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>{job.appliedDate || 'No date'}</span>
                        </span>
                      </div>

                      {/* OA Event Date or Notes Badge */}
                      <div className="mt-2 flex items-center justify-between gap-1.5 flex-wrap">
                        {job.oaEventDate && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 truncate">
                            OA: {new Date(job.oaEventDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}

                        {/* Interactive Notes Button as requested: "if there is any notes related to each round it needs to show on clicking note" */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenNotes) onOpenNotes(job);
                          }}
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all ${
                            job.oaNotes
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:scale-105'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                          }`}
                          title="Click to view OA reflections & interview round notes"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{job.oaNotes ? '📝 View Notes' : 'Notes / Rounds'}</span>
                        </button>
                      </div>

                      {/* Fast Stage Shift Controls */}
                      <div
                        className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {activeTab === 'active' ? (
                          <>
                            {prevStatus ? (
                              <button
                                type="button"
                                onClick={() => onStatusChange(job.id, prevStatus)}
                                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                title={`Move back to ${STATUS_CONFIG[prevStatus]?.label}`}
                              >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Back</span>
                              </button>
                            ) : <div />}

                            <div className="flex items-center gap-1">
                              {job.status === 'INTERVIEW' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onStatusChange(job.id, 'REJECTED')}
                                    className="text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-1.5 py-0.5 rounded transition-colors"
                                    title="Move to Past Applications as Rejected"
                                  >
                                    Rejected
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onStatusChange(job.id, 'SELECTED')}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 py-0.5 rounded transition-colors"
                                    title="Offer Received - Move to Past Applications"
                                  >
                                    <span>Offer 🎉</span>
                                  </button>
                                </>
                              ) : nextStatus ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onStatusChange(job.id, 'REJECTED')}
                                    className="text-[10px] text-zinc-400 hover:text-rose-500 transition-colors px-1"
                                    title="Archive Application"
                                  >
                                    Archive
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onStatusChange(job.id, nextStatus)}
                                    className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-2 py-0.5 rounded transition-colors"
                                    title={`Advance to ${STATUS_CONFIG[nextStatus]?.label}`}
                                  >
                                    <span>Advance</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </>
                        ) : (
                          /* Past Applications Tab Controls: Re-open application back to active pipeline */
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-zinc-400">
                              {job.status === 'SELECTED' ? '🎉 Accepted Offer' : '📁 Archived'}
                            </span>
                            <button
                              type="button"
                              onClick={() => onStatusChange(job.id, 'INTERVIEW')}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-2 py-0.5 rounded transition-colors"
                              title="Re-open into Active Pipeline"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reopen to Active</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
