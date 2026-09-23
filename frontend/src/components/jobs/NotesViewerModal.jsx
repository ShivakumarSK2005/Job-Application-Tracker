import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { BookOpen, Calendar, Video, Clock, CheckCircle2, XCircle, Save, Loader2, Sparkles, Building, Briefcase } from 'lucide-react';
import { interviewApi } from '../../api/interviewApi';
import { jobApi } from '../../api/jobApi';
import { useToast } from '../common/Toast';

export default function NotesViewerModal({ isOpen, onClose, job, onNotesUpdated }) {
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'oa', 'interviews'
  const [oaNotesText, setOaNotesText] = useState('');
  const [isSavingOaNotes, setIsSavingOaNotes] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (isOpen && job?.id) {
      setOaNotesText(job.oaNotes || '');
      fetchInterviews();
    }
  }, [isOpen, job]);

  const fetchInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const data = await interviewApi.getInterviews(job.id);
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load interviews in Notes modal', err);
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleSaveOaNotes = async () => {
    setIsSavingOaNotes(true);
    try {
      await jobApi.updateJob(job.id, {
        ...job,
        oaNotes: oaNotesText,
      });
      toast.success('Notes saved successfully');
      if (onNotesUpdated) {
        onNotesUpdated(job.id, oaNotesText);
      }
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setIsSavingOaNotes(false);
    }
  };

  if (!job) return null;

  const totalRoundsWithNotes = interviews.filter((i) => i.notes && i.notes.trim()).length;
  const hasOaNotes = Boolean(job.oaNotes?.trim() || job.oaEventDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stage Notes & Interview Learnings"
      description={`${job.role} @ ${job.company}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All Notes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('oa')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'oa'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>Online Assessment</span>
            {hasOaNotes && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interviews')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'interviews'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>Interview Rounds ({interviews.length})</span>
            {totalRoundsWithNotes > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {totalRoundsWithNotes}
              </span>
            )}
          </button>
        </div>

        {/* Section 1: Online Assessment Notes */}
        {(activeTab === 'all' || activeTab === 'oa') && (
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Online Assessment (OA) Notes & Reflections
                </h4>
              </div>
              {job.oaPlatform && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200">
                  Platform: {job.oaPlatform}
                </span>
              )}
            </div>

            {job.oaEventDate && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Scheduled on:{' '}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {new Date(job.oaEventDate).toLocaleString()}
                </span>
              </p>
            )}

            <div className="space-y-1.5">
              <textarea
                value={oaNotesText}
                onChange={(e) => setOaNotesText(e.target.value)}
                placeholder="Log questions asked, topics covered, code challenges, or mistakes made during this assessment..."
                rows={4}
                className="w-full px-3 py-2 text-xs rounded-lg border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveOaNotes}
                  disabled={isSavingOaNotes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSavingOaNotes ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Assessment Notes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Interview Rounds */}
        {(activeTab === 'all' || activeTab === 'interviews') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Interview Rounds ({interviews.length})
              </h4>
            </div>

            {loadingInterviews ? (
              <div className="space-y-2 py-4">
                <div className="h-16 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
                <div className="h-16 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                No interview rounds logged yet for this application.
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {interviews.map((item) => {
                  const category = item.roundCategory || 'Technical';
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                category === 'HR'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                  : category === 'Screening'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : category === 'Others'
                                  ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {category}
                            </span>
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              {item.round}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              {item.interviewDate}
                              {item.interviewTime && ` at ${item.interviewTime}`}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Video className="w-3.5 h-3.5 text-zinc-400" />
                              {item.type}
                            </span>
                            {item.interviewer && <span>Interviewer: {item.interviewer}</span>}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            item.result === 'PASSED'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800'
                              : item.result === 'FAILED'
                              ? 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950 dark:border-rose-800'
                              : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800'
                          }`}
                        >
                          {item.result || 'PENDING'}
                        </span>
                      </div>

                      {/* Notes / Learnings */}
                      {item.notes ? (
                        <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                            Round Notes & Feedback:
                          </span>
                          {item.notes}
                        </div>
                      ) : (
                        <p className="text-[11px] italic text-zinc-400">
                          No notes recorded for this round.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
