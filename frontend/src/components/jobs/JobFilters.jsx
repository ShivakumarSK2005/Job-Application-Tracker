import React from 'react';
import { Search, LayoutGrid, Table, X, Briefcase, Archive, CheckCircle2 } from 'lucide-react';

export const ACTIVE_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Active' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'ONLINE_ASSESSMENT', label: 'Assessment' },
  { value: 'INTERVIEW', label: 'Interview' },
];

export const PAST_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Past' },
  { value: 'SELECTED', label: 'Selected / Offers' },
  { value: 'REJECTED', label: 'Archived / Rejected' },
];

export const SORT_OPTIONS = [
  { value: 'appliedDate,desc', label: 'Applied Date (Newest first)' },
  { value: 'appliedDate,asc', label: 'Applied Date (Oldest first)' },
  { value: 'company,asc', label: 'Company Name (A-Z)' },
  { value: 'company,desc', label: 'Company Name (Z-A)' },
];

export default function JobFilters({
  activeTab = 'active',
  onActiveTabChange,
  activeCount = 0,
  pastCount = 0,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResults,
}) {
  const currentStatusOptions = activeTab === 'active' ? ACTIVE_STATUS_OPTIONS : PAST_STATUS_OPTIONS;
  const hasActiveFilters = searchQuery.trim() !== '' || selectedStatus !== 'ALL';

  return (
    <div className="flex flex-col gap-4">
      {/* Top Tab Switcher: Active Applications vs Past Applications */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onActiveTabChange('active');
              onStatusChange('ALL');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'active'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Active Applications</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                activeTab === 'active'
                  ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onActiveTabChange('past');
              onStatusChange('ALL');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'past'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Past Applications</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                activeTab === 'past'
                  ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {pastCount}
            </span>
          </button>
        </div>

        {/* View Mode Toggle: Kanban vs Table */}
        <div className="flex items-center p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={() => onViewModeChange('board')}
            title="Kanban Board View"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'board'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Data Table View"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input & Sort row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${activeTab === 'active' ? 'active' : 'past'} applications or role...`}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {currentStatusOptions.map((opt) => {
            const isSelected = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
