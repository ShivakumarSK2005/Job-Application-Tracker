import { useEffect, useState, useCallback, useRef } from 'react';
import { notificationService } from './notificationService';
import { interviewApi } from '../api/interviewApi';

const TAG_TO_MINUTES = {
  '30m': 30,
  '1h': 60,
  '1d': 1440,
  '2d': 2880,
  '3d': 4320,
  '1w': 10080,
};

const TAG_TO_HUMAN = {
  '30m': '30 mins before',
  '1h': '1 hour before',
  '1d': '1 day before',
  '2d': '2 days before',
  '3d': '3 days before',
  '1w': '1 week before',
};

export function useReminderEngine(jobs = [], toast = null) {
  const [permission, setPermission] = useState(notificationService.getPermissionStatus());
  const interviewsCacheRef = useRef(new Map());

  // Check and update permission state
  const refreshPermission = useCallback(() => {
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const requestPermission = useCallback(async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      notificationService.triggerTestReminder();
      if (toast) {
        toast.success('🔔 Desktop Push Notifications activated successfully!');
      }
    } else if (res === 'denied') {
      if (toast) {
        toast.warning('Notifications blocked in browser settings. You will still receive in-app alerts.');
      }
    }
    return res;
  }, [toast]);

  // Fetch interviews for jobs in INTERVIEW stage to verify their reminders
  useEffect(() => {
    const interviewJobs = jobs.filter((j) => j.status === 'INTERVIEW');
    if (interviewJobs.length === 0) return;

    let isMounted = true;
    interviewJobs.forEach(async (job) => {
      try {
        const rounds = await interviewApi.getInterviews(job.id);
        if (isMounted && Array.isArray(rounds)) {
          interviewsCacheRef.current.set(job.id, rounds);
        }
      } catch (err) {
        // Silently skip if fetch fails
      }
    });

    return () => {
      isMounted = false;
    };
  }, [jobs]);

  // Main scanning loop: executes every 15 seconds against the user's local clock
  const scanReminders = useCallback(() => {
    const nowMs = Date.now();

    // 1. Scan Online Assessment (OA) Reminders on active jobs
    jobs.forEach((job) => {
      if (!job.oaEventDate || !Array.isArray(job.oaReminders) || job.oaReminders.length === 0) {
        return;
      }

      const eventDate = new Date(job.oaEventDate);
      const eventMs = eventDate.getTime();
      if (isNaN(eventMs)) return;

      // Skip if event has already passed by more than 5 minutes
      if (eventMs < nowMs - 5 * 60 * 1000) return;

      job.oaReminders.forEach((tag) => {
        const minutesBefore = TAG_TO_MINUTES[tag];
        if (!minutesBefore) return;

        const targetTriggerMs = eventMs - minutesBefore * 60 * 1000;
        // Trigger if current time has reached or passed the trigger point (within a 15-minute window)
        if (nowMs >= targetTriggerMs && nowMs < eventMs && nowMs - targetTriggerMs <= 15 * 60 * 1000) {
          const dispatchKey = `trackr_dispatched_oa_${job.id}_${tag}_${job.oaEventDate}`;
          if (!localStorage.getItem(dispatchKey)) {
            localStorage.setItem(dispatchKey, String(nowMs));

            const timeDisplay =
              eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) +
              ' at ' +
              eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const tagHuman = TAG_TO_HUMAN[tag] || tag;

            // Trigger Desktop Browser Push Notification
            notificationService.notifyEvent({
              type: 'Online Assessment',
              role: job.role,
              company: job.company,
              timeDisplay,
              platform: job.oaPlatform || 'Online Assessment',
              notes: job.oaNotes || '',
              tagHuman,
            });

            // Trigger In-App Toast
            if (toast) {
              toast.info(
                `🔔 Reminder: Upcoming OA for ${job.role} @ ${job.company} scheduled for ${timeDisplay} (${tagHuman})`
              );
            }
          }
        }
      });
    });

    // 2. Scan Interview Rounds from cache
    interviewsCacheRef.current.forEach((rounds, jobId) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job || !Array.isArray(rounds)) return;

      rounds.forEach((interview) => {
        if (!interview.interviewDate || !Array.isArray(interview.reminders) || interview.reminders.length === 0) {
          return;
        }

        // Parse interview date & time
        let interviewMs = null;
        if (interview.interviewTime) {
          interviewMs = new Date(`${interview.interviewDate}T${interview.interviewTime}`).getTime();
        } else {
          interviewMs = new Date(`${interview.interviewDate}T09:00:00`).getTime();
        }

        if (isNaN(interviewMs)) return;
        if (interviewMs < nowMs - 5 * 60 * 1000) return;

        interview.reminders.forEach((tag) => {
          const minutesBefore = TAG_TO_MINUTES[tag];
          if (!minutesBefore) return;

          const targetTriggerMs = interviewMs - minutesBefore * 60 * 1000;
          if (nowMs >= targetTriggerMs && nowMs < interviewMs && nowMs - targetTriggerMs <= 15 * 60 * 1000) {
            const dispatchKey = `trackr_dispatched_int_${interview.id}_${tag}_${interview.interviewDate}_${interview.interviewTime || ''}`;
            if (!localStorage.getItem(dispatchKey)) {
              localStorage.setItem(dispatchKey, String(nowMs));

              const evDate = new Date(interviewMs);
              const timeDisplay =
                evDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) +
                ' at ' +
                evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const tagHuman = TAG_TO_HUMAN[tag] || tag;

              // Trigger Desktop Push Notification
              notificationService.notifyEvent({
                type: `Interview: ${interview.round || 'Round'}`,
                role: job.role,
                company: job.company,
                timeDisplay,
                platform: interview.type || 'Interview',
                meetingLink: interview.meetingLink || '',
                notes: interview.notes || '',
                tagHuman,
              });

              // Trigger In-App Toast
              if (toast) {
                toast.info(
                  `🔔 Reminder: ${interview.round} for ${job.company} scheduled for ${timeDisplay} (${tagHuman})`
                );
              }
            }
          }
        });
      });
    });
  }, [jobs, toast]);

  // Run immediately and every 15 seconds
  useEffect(() => {
    scanReminders();
    const intervalId = setInterval(scanReminders, 15000);
    return () => clearInterval(intervalId);
  }, [scanReminders]);

  return {
    permission,
    requestPermission,
    refreshPermission,
    sendTestNotification: () => notificationService.triggerTestReminder(),
  };
}
