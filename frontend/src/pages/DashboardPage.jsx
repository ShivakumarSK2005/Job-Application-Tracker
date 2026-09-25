import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import MetricCards from '../components/dashboard/MetricCards';
import PipelineFunnel from '../components/dashboard/PipelineFunnel';
import JobFilters from '../components/jobs/JobFilters';
import JobBoard from '../components/jobs/JobBoard';
import JobTable from '../components/jobs/JobTable';
import JobFormModal from '../components/jobs/JobFormModal';
import JobDetailDrawer from '../components/jobs/JobDetailDrawer';
import StageTransitionModal from '../components/jobs/StageTransitionModal';
import NotesViewerModal from '../components/jobs/NotesViewerModal';
import InterviewModal from '../components/interviews/InterviewModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import { jobApi } from '../api/jobApi';
import { interviewApi } from '../api/interviewApi';
import { dashboardApi } from '../api/dashboardApi';

export default function DashboardPage() {
  // Metrics & Applications State
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
  });

  // Filter & View State
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortOption, setSortOption] = useState('appliedDate,desc');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'table'

  // Modal & Drawer State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState(null);
  const [viewingNotesJob, setViewingNotesJob] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [transitionState, setTransitionState] = useState(null); // { job, targetStatus, pendingNextModal }
  const [schedulingInterviewJob, setSchedulingInterviewJob] = useState(null); // job when scheduling interview
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  // Load Dashboard Metrics
  const loadMetrics = useCallback(async () => {
    try {
      const data = await dashboardApi.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Load Jobs
  const loadJobs = useCallback(
    async (page = 0, size = pagination.pageSize) => {
      setJobsLoading(true);
      try {
        const data = await jobApi.getJobs({
          page,
          size,
          sort: sortOption,
          company: searchQuery,
          status: selectedStatus,
        });

        if (data && Array.isArray(data.content)) {
          setJobs(data.content);
          setPagination({
            pageNumber: data.number || 0,
            pageSize: data.size || size,
            totalElements: data.totalElements || 0,
            totalPages: data.totalPages || 1,
          });

          // If drawer is open, keep selected job data up-to-date
          if (selectedJobForDrawer) {
            const updated = data.content.find((j) => j.id === selectedJobForDrawer.id);
            if (updated) setSelectedJobForDrawer(updated);
          }
        } else if (Array.isArray(data)) {
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
        toast.error('Unable to fetch job applications');
      } finally {
        setJobsLoading(false);
      }
    },
    [sortOption, searchQuery, selectedStatus, pagination.pageSize, selectedJobForDrawer, toast]
  );

  // Initial Load
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Load jobs when filters change (debounced for search)
  useEffect(() => {
    const handler = setTimeout(() => {
      loadJobs(0);
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedStatus, sortOption]);

  // Add / Edit Job Handler
  const handleSaveJob = async (formData) => {
    setActionLoading(true);
    try {
      if (editingJob) {
        await jobApi.updateJob(editingJob.id, formData);
        toast.success(`Updated application for ${formData.company}`);
      } else {
        await jobApi.createJob(formData);
        toast.success(`Application for ${formData.company} logged successfully`);
      }
      setIsFormModalOpen(false);
      setEditingJob(null);
      loadJobs(pagination.pageNumber);
      loadMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save application';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const STAGE_ORDER = {
    APPLIED: 0,
    ONLINE_ASSESSMENT: 1,
    INTERVIEW: 2,
    SELECTED: 3,
    REJECTED: 3,
  };

  // Quick Status Update Handler
  const handleStatusChange = async (jobId, newStatus) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const currentRank = STAGE_ORDER[targetJob.status] ?? 0;
    const targetRank = STAGE_ORDER[newStatus] ?? 0;

    // 1. Moving backward (e.g. INTERVIEW -> ONLINE_ASSESSMENT, OA -> APPLIED, REJECTED/SELECTED -> INTERVIEW):
    // Strictly execute immediately with NO notes prompt and NO scheduling modal
    if (targetRank < currentRank) {
      await executeStatusUpdate(jobId, newStatus, null);
      return;
    }

    // 2. Moving forward to ONLINE_ASSESSMENT: open OA scheduling window first
    if (newStatus === 'ONLINE_ASSESSMENT') {
      setEditingJob({ ...targetJob, status: 'ONLINE_ASSESSMENT' });
      setIsFormModalOpen(true);
      return;
    }

    // 3. Advancing from OA -> INTERVIEW:
    // First ask for Interview scheduling details (date, time, category, meeting link, reminders)
    // Then immediately open the reflection notes modal for past stage (OA)
    if (targetJob.status === 'ONLINE_ASSESSMENT' && newStatus === 'INTERVIEW') {
      setSchedulingInterviewJob(targetJob);
      return;
    }

    // 4. Advancing to outcome (OA -> REJECTED, INTERVIEW -> SELECTED or REJECTED)
    if (
      (targetJob.status === 'ONLINE_ASSESSMENT' && newStatus === 'REJECTED') ||
      (targetJob.status === 'INTERVIEW' && (newStatus === 'SELECTED' || newStatus === 'REJECTED'))
    ) {
      setTransitionState({ job: targetJob, targetStatus: newStatus });
      return;
    }

    // Direct transition for other combinations
    await executeStatusUpdate(jobId, newStatus, null);
  };

  const executeStatusUpdate = async (jobId, newStatus, notes = null) => {
    try {
      await jobApi.updateJobStatus(jobId, newStatus, notes);
      if (newStatus === 'SELECTED') {
        toast.success('🎉 Congratulations! Application moved to Past Applications (Offers)');
      } else if (newStatus === 'REJECTED') {
        toast.success('Application archived and moved to Past Applications');
      } else {
        toast.success('Stage updated');
      }

      // Optimistically update locally
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            const updated = { ...j, status: newStatus };
            if (notes) {
              if (j.status === 'ONLINE_ASSESSMENT') {
                updated.oaNotes = j.oaNotes ? `${j.oaNotes}\n\n${notes}` : notes;
              } else {
                updated.interviewNotes = j.interviewNotes ? `${j.interviewNotes}\n\n${notes}` : notes;
              }
            }
            return updated;
          }
          return j;
        })
      );

      if (selectedJobForDrawer && selectedJobForDrawer.id === jobId) {
        setSelectedJobForDrawer((prev) => {
          const updated = { ...prev, status: newStatus };
          if (notes) {
            if (prev.status === 'ONLINE_ASSESSMENT') {
              updated.oaNotes = prev.oaNotes ? `${prev.oaNotes}\n\n${notes}` : notes;
            } else {
              updated.interviewNotes = prev.interviewNotes ? `${prev.interviewNotes}\n\n${notes}` : notes;
            }
          }
          return updated;
        });
      }

      loadMetrics();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  // Delete Job Handler
  const handleDeleteJob = async () => {
    if (!deletingJobId) return;
    setActionLoading(true);
    try {
      await jobApi.deleteJob(deletingJobId);
      toast.success('Job application deleted');
      if (selectedJobForDrawer?.id === deletingJobId) {
        setSelectedJobForDrawer(null);
      }
      setDeletingJobId(null);
      loadJobs(pagination.pageNumber);
      loadMetrics();
    } catch (err) {
      toast.error('Failed to delete job application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSortOption('appliedDate,desc');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500/20">
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={() => {
          setEditingJob(null);
          setIsFormModalOpen(true);
        }}
        stats={metrics}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards Section */}
        <section>
          <MetricCards metrics={metrics} loading={metricsLoading} />
        </section>

        {/* Pipeline Distribution Funnel */}
        <section>
          <PipelineFunnel metrics={metrics} />
        </section>

        {/* Filter & View Switcher Bar */}
        <section className="pt-2">
          <JobFilters
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            activeCount={
              (metrics?.applied || 0) +
              (metrics?.onlineAssessments || 0) +
              (metrics?.interviews || 0)
            }
            pastCount={
              (metrics?.selected || 0) +
              (metrics?.rejected || 0)
            }
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortOption={sortOption}
            onSortChange={setSortOption}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onResetFilters={handleResetFilters}
            totalResults={pagination.totalElements}
          />
        </section>

        {/* Primary View: Board or Table */}
        <section className="pb-12">
          {viewMode === 'board' ? (
            <JobBoard
              jobs={jobs.filter((job) => {
                if (activeTab === 'active') {
                  if (selectedStatus === 'ALL') {
                    return ['APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW'].includes(job.status);
                  }
                  return job.status === selectedStatus;
                } else {
                  if (selectedStatus === 'ALL') {
                    return ['SELECTED', 'REJECTED'].includes(job.status);
                  }
                  return job.status === selectedStatus;
                }
              })}
              activeTab={activeTab}
              loading={jobsLoading}
              onSelectJob={(job) => setSelectedJobForDrawer(job)}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsFormModalOpen(true);
              }}
              onDeleteJob={(id) => setDeletingJobId(id)}
              onStatusChange={handleStatusChange}
              onOpenNotes={(job) => setViewingNotesJob(job)}
            />
          ) : (
            <JobTable
              jobs={jobs.filter((job) => {
                if (activeTab === 'active') {
                  if (selectedStatus === 'ALL') {
                    return ['APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW'].includes(job.status);
                  }
                  return job.status === selectedStatus;
                } else {
                  if (selectedStatus === 'ALL') {
                    return ['SELECTED', 'REJECTED'].includes(job.status);
                  }
                  return job.status === selectedStatus;
                }
              })}
              loading={jobsLoading}
              pagination={pagination}
              onPageChange={(page) => loadJobs(page)}
              onPageSizeChange={(size) => loadJobs(0, size)}
              onSelectJob={(job) => setSelectedJobForDrawer(job)}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsFormModalOpen(true);
              }}
              onDeleteJob={(id) => setDeletingJobId(id)}
              onStatusChange={handleStatusChange}
              onOpenNotes={(job) => setViewingNotesJob(job)}
            />
          )}
        </section>
      </main>

      {/* Add / Edit Modal */}
      <JobFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleSaveJob}
        initialData={editingJob}
        isLoading={actionLoading}
      />

      {/* Job Details & Interview Manager Drawer */}
      <JobDetailDrawer
        isOpen={Boolean(selectedJobForDrawer)}
        onClose={() => setSelectedJobForDrawer(null)}
        job={selectedJobForDrawer}
        onEdit={(job) => {
          setEditingJob(job);
          setIsFormModalOpen(true);
        }}
        onDelete={(id) => setDeletingJobId(id)}
        onStatusChange={handleStatusChange}
      />

      {/* Schedule Interview Modal when advancing to INTERVIEW */}
      <InterviewModal
        isOpen={Boolean(schedulingInterviewJob)}
        onClose={() => {
          const currentJob = schedulingInterviewJob;
          setSchedulingInterviewJob(null);
          // Prompt for past OA notes even if skipped interview scheduling
          if (currentJob) {
            setTransitionState({ job: currentJob, targetStatus: 'INTERVIEW' });
          }
        }}
        onSubmit={async (interviewData) => {
          const currentJob = schedulingInterviewJob;
          setSchedulingInterviewJob(null);
          try {
            await interviewApi.createInterview(currentJob.id, interviewData);
            toast.success('Interview round scheduled');
            // Advance stage and prompt for past OA mistakes/notes!
            setTransitionState({ job: currentJob, targetStatus: 'INTERVIEW' });
          } catch (err) {
            toast.error('Failed to schedule interview round');
            // Still allow transition
            setTransitionState({ job: currentJob, targetStatus: 'INTERVIEW' });
          }
        }}
        jobTitle={schedulingInterviewJob ? `${schedulingInterviewJob.role} @ ${schedulingInterviewJob.company}` : ''}
        isLoading={actionLoading}
      />

      {/* Standalone Reflection / Mistakes Notes on Stage Transition */}
      <StageTransitionModal
        isOpen={Boolean(transitionState)}
        onClose={() => setTransitionState(null)}
        job={transitionState?.job}
        targetStatus={transitionState?.targetStatus}
        onConfirm={async (notes) => {
          if (!transitionState) return;
          const { job, targetStatus } = transitionState;
          setTransitionState(null);
          await executeStatusUpdate(job.id, targetStatus, notes);
        }}
        isLoading={actionLoading}
      />

      {/* Confirm Job Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingJobId)}
        onClose={() => setDeletingJobId(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job Application"
        message="Are you sure you want to permanently delete this application and all linked interview rounds? This action cannot be reversed."
        isLoading={actionLoading}
      />

      {/* Standalone Notes & Learnings Viewer Modal */}
      <NotesViewerModal
        isOpen={Boolean(viewingNotesJob)}
        onClose={() => setViewingNotesJob(null)}
        job={viewingNotesJob}
        onNotesUpdated={(id, updatedOaNotes, updatedInterviewNotes) => {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === id
                ? { ...j, oaNotes: updatedOaNotes, interviewNotes: updatedInterviewNotes }
                : j
            )
          );
          if (selectedJobForDrawer?.id === id) {
            setSelectedJobForDrawer((prev) => ({
              ...prev,
              oaNotes: updatedOaNotes,
              interviewNotes: updatedInterviewNotes,
            }));
          }
          if (viewingNotesJob?.id === id) {
            setViewingNotesJob((prev) => ({
              ...prev,
              oaNotes: updatedOaNotes,
              interviewNotes: updatedInterviewNotes,
            }));
          }
        }}
      />
    </div>
  );
}
