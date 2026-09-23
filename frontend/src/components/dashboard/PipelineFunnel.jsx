import React from 'react';

export default function PipelineFunnel({ metrics }) {
  const total = metrics?.totalApplications || 0;
  const applied = metrics?.applied || 0;
  const assessments = metrics?.onlineAssessments || 0;
  const interviews = metrics?.interviews || 0;
  const selected = metrics?.selected || 0;
  const rejected = metrics?.rejected || 0;

  if (total === 0) return null;

  const appliedPct = (applied / total) * 100;
  const assessmentsPct = (assessments / total) * 100;
  const interviewsPct = (interviews / total) * 100;
  const selectedPct = (selected / total) * 100;
  const rejectedPct = (rejected / total) * 100;

  return (
    <div className="p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider">
          Pipeline Distribution
        </h4>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {total} Active & Resolved Applications
        </span>
      </div>

      {/* Progress segment bar */}
      <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
        {appliedPct > 0 && (
          <div
            style={{ width: `${appliedPct}%` }}
            className="bg-sky-500 transition-all duration-500"
            title={`Applied: ${applied} (${appliedPct.toFixed(1)}%)`}
          />
        )}
        {assessmentsPct > 0 && (
          <div
            style={{ width: `${assessmentsPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Assessment: ${assessments} (${assessmentsPct.toFixed(1)}%)`}
          />
        )}
        {interviewsPct > 0 && (
          <div
            style={{ width: `${interviewsPct}%` }}
            className="bg-indigo-500 transition-all duration-500"
            title={`Interview: ${interviews} (${interviewsPct.toFixed(1)}%)`}
          />
        )}
        {selectedPct > 0 && (
          <div
            style={{ width: `${selectedPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Selected: ${selected} (${selectedPct.toFixed(1)}%)`}
          />
        )}
        {rejectedPct > 0 && (
          <div
            style={{ width: `${rejectedPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Rejected: ${rejected} (${rejectedPct.toFixed(1)}%)`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Applied ({applied})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Assessments ({assessments})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Interviews ({interviews})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Selected ({selected})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Rejected ({rejected})</span>
        </div>
      </div>
    </div>
  );
}
