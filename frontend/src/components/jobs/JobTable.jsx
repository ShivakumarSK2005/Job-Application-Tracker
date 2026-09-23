import { Building, MapPin, Calendar, Edit2, Trash2, ChevronLeft, ChevronRight, MessageSquareCode, BookOpen } from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from '../common/StatusBadge';

const STATUS_KEYS = ['APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED'];

export default function JobTable({
  jobs,
  loading,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onStatusChange,
  onOpenNotes,
}) {
  const { pageNumber = 0, pageSize = 10, totalElements = 0, totalPages = 1 } = pagination || {};

  const startIndex = totalElements === 0 ? 0 : pageNumber * pageSize + 1;
  const endIndex = Math.min((pageNumber + 1) * pageSize, totalElements);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 overflow-hidden shadow-sm">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Role & Company</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Applied Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
                    <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                  <p className="font-medium">No applications found</p>
                  <p className="text-[11px] mt-1 text-zinc-400">
                    Try adjusting your search query or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  {/* Role & Company */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {job.role}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{job.company}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                  </td>

                  {/* Applied Date & OA Event */}
                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{job.appliedDate || '—'}</span>
                    </div>
                    {job.oaEventDate && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                        OA: {new Date(job.oaEventDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </td>

                  {/* Status Dropdown / Badge */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={job.status}
                      onChange={(e) => onStatusChange(job.id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {STATUS_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {STATUS_CONFIG[k]?.label || k}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenNotes && onOpenNotes(job)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                        title="View stage notes & learnings"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Notes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectJob(job)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Interviews & Details"
                      >
                        <MessageSquareCode className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Rounds</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditJob(job)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Application"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteJob(job.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{startIndex}</strong> - <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{endIndex}</strong> of <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{totalElements}</strong>
          </span>

          {/* Page size selector */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-zinc-200 dark:border-zinc-800">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Previous / Next buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 0 || loading}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 font-medium text-zinc-700 dark:text-zinc-200">
            Page {pageNumber + 1} of {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber + 1 >= totalPages || loading}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
