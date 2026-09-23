import React from 'react';
import { Layers, Send, BrainCircuit, Calendar, Award, XCircle } from 'lucide-react';

export default function MetricCards({ metrics, loading }) {
  const total = metrics?.totalApplications || 0;
  const applied = metrics?.applied || 0;
  const assessments = metrics?.onlineAssessments || 0;
  const interviews = metrics?.interviews || 0;
  const selected = metrics?.selected || 0;
  const rejected = metrics?.rejected || 0;

  const offerRate = total > 0 ? ((selected / total) * 100).toFixed(1) : 0;
  const interviewRate = total > 0 ? ((interviews / total) * 100).toFixed(1) : 0;

  const cards = [
    {
      title: 'Total Applications',
      value: total,
      subtext: 'Across all stages',
      icon: Layers,
      color: 'text-zinc-700 dark:text-zinc-300',
      bgColor: 'bg-zinc-100 dark:bg-zinc-800/80',
    },
    {
      title: 'Applied',
      value: applied,
      subtext: total > 0 ? `${Math.round((applied / total) * 100)}% of pipeline` : 'Initial stage',
      icon: Send,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    },
    {
      title: 'Assessments',
      value: assessments,
      subtext: 'Online tests & OA',
      icon: BrainCircuit,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Interviews',
      value: interviews,
      subtext: `${interviewRate}% conversion`,
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'Selected / Offers',
      value: selected,
      subtext: `${offerRate}% offer rate`,
      icon: Award,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Archived / Rejected',
      value: rejected,
      subtext: total > 0 ? `${Math.round((rejected / total) * 100)}% outcome` : 'Past records',
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-1">
              <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {loading ? (
                  <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
