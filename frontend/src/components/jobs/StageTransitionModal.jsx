import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Sparkles, ArrowRight, Loader2, Award, AlertCircle, FileText } from 'lucide-react';
import { STATUS_CONFIG } from '../common/StatusBadge';

export default function StageTransitionModal({
  isOpen,
  onClose,
  job,
  targetStatus,
  onConfirm,
  isLoading = false,
}) {
  const [notes, setNotes] = useState('');

  if (!isOpen || !job || !targetStatus) return null;

  const currentConf = STATUS_CONFIG[job.status] || { label: job.status };
  const targetConf = STATUS_CONFIG[targetStatus] || { label: targetStatus };

  const isAdvancingToInterview = targetStatus === 'INTERVIEW';
  const isSelected = targetStatus === 'SELECTED';
  const isRejected = targetStatus === 'REJECTED';

  let title = `Advancing to ${targetConf.label}`;
  let promptTitle = 'Stage Learnings & Reflection Notes (Optional)';
  let promptDesc = 'Reflect on how this stage went before moving forward.';
  let placeholder = 'What questions were asked? What mistakes did you make? What should you review or do differently?';

  if (job.status === 'ONLINE_ASSESSMENT' && isAdvancingToInterview) {
    title = 'Online Assessment Passed! Moving to Interviews';
    promptTitle = '📝 OA Learnings & Mistakes to Remember';
    promptDesc = 'Record any mistakes made in the test (e.g., test cases missed, dynamic programming or graphs) so you can review before the interviews.';
    placeholder = 'e.g. Cleared 14/15 test cases; struggled on tree traversal corner cases. Brush up on recursion before interview round 1.';
  } else if (job.status === 'ONLINE_ASSESSMENT' && isRejected) {
    title = 'Online Assessment Not Cleared';
    promptTitle = '📝 OA Post-Mortem & Mistakes';
    promptDesc = 'What went wrong in the test? Logging this will help you avoid the same mistakes in future applications.';
    placeholder = 'e.g. Ran out of time on problem 2; need to practice LeetCode medium timed tests.';
  } else if (job.status === 'INTERVIEW' && isSelected) {
    title = '🎉 Congratulations on the Offer!';
    promptTitle = '📝 Winning Factors & Key Highlights';
    promptDesc = 'What made you stand out during the interviews? What compensation or role details were discussed?';
    placeholder = 'e.g. Strong system design explanation, good culture fit discussion. Offer package pending discussion.';
  } else if (job.status === 'INTERVIEW' && isRejected) {
    title = 'Interview Not Cleared';
    promptTitle = '📝 Interview Mistakes & Lessons Learned';
    promptDesc = 'What tricky questions or behavioural feedback came up? What will you practice next time?';
    placeholder = 'e.g. Interviewer asked in-depth multi-threading in Java; need to review concurrent hashmap and thread pools.';
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onConfirm(notes);
    setNotes('');
  };

  const handleSkip = () => {
    onConfirm('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`${job.role} @ ${job.company}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Stage Transition Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {currentConf.label}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {targetConf.label}
            </span>
          </div>
          {isSelected ? (
            <Award className="w-4 h-4 text-emerald-500" />
          ) : isRejected ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-500" />
          )}
        </div>

        {/* Standalone Notes Question Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {promptTitle}
            </label>
            <span className="text-[10px] text-zinc-400">Optional</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {promptDesc}
          </p>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
            autoFocus
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            Skip for now
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save & Advance</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
