import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Video, Edit2, Trash2, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { interviewApi } from '../../api/interviewApi';
import { useToast } from '../common/Toast';
import InterviewModal from './InterviewModal';
import ConfirmDialog from '../common/ConfirmDialog';

export default function InterviewList({ jobId, jobTitle }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const data = await interviewApi.getInterviews(jobId);
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load interview rounds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchInterviews();
    }
  }, [jobId]);

  const handleSaveInterview = async (formData) => {
    setActionLoading(true);
    try {
      if (editingInterview) {
        await interviewApi.updateInterview(jobId, editingInterview.id, formData);
        toast.success('Interview round updated');
      } else {
        await interviewApi.createInterview(jobId, formData);
        toast.success('Interview round scheduled');
      }
      setIsModalOpen(false);
      setEditingInterview(null);
      fetchInterviews();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save interview';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInterview = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await interviewApi.deleteInterview(jobId, deletingId);
      toast.success('Interview round deleted');
      setDeletingId(null);
      fetchInterviews();
    } catch (err) {
      toast.error('Failed to delete interview round');
    } finally {
      setActionLoading(false);
    }
  };

  const getResultBadge = (result) => {
    const val = (result || 'PENDING').toUpperCase();
    if (val === 'PASSED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Passed
        </span>
      );
    }
    if (val === 'FAILED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
        <Clock className="w-3 h-3" />
        {result || 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Interview Rounds ({interviews.length})
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Keep track of technical and behavioral stages
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingInterview(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Round</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 py-3">
          <div className="h-14 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
          <div className="h-14 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            No interviews scheduled yet
          </p>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
            Add your upcoming screening, technical rounds, or hiring manager discussions.
          </p>
        </div>
      ) : (
        <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
          {interviews.map((item, index) => (
            <div
              key={item.id}
              className="relative p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              {/* Timeline marker */}
              <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {item.roundCategory && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.roundCategory === 'HR'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : item.roundCategory === 'Screening'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : item.roundCategory === 'Others'
                          ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {item.roundCategory}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.round}
                    </span>
                    {getResultBadge(item.result)}
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
                    {item.interviewer && (
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        {item.interviewer}
                      </span>
                    )}
                  </div>

                  {/* Mistakes & Learning Notes */}
                  {item.notes && item.notes.trim() && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-[11px] leading-relaxed">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-400 mb-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Mistakes & Takeaways for Next Time:</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap pl-5">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInterview(item);
                      setIsModalOpen(true);
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Edit round"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(item.id)}
                    className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete round"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing */}
      <InterviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInterview(null);
        }}
        onSubmit={handleSaveInterview}
        jobTitle={jobTitle}
        initialData={editingInterview}
        isLoading={actionLoading}
      />

      {/* Confirm deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteInterview}
        title="Delete Interview Round"
        message="Are you sure you want to remove this interview round? This cannot be undone."
        isLoading={actionLoading}
      />
    </div>
  );
}
