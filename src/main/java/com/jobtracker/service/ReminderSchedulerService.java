package com.jobtracker.service;

import com.jobtracker.model.Interview;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@EnableScheduling
public class ReminderSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(ReminderSchedulerService.class);

    private final JobRepository jobRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // In-memory tracker of already dispatched reminders so duplicate emails aren't sent
    private final Set<String> dispatchedReminders = new HashSet<>();

    public ReminderSchedulerService(JobRepository jobRepository,
                                    InterviewRepository interviewRepository,
                                    UserRepository userRepository,
                                    EmailService emailService) {
        this.jobRepository = jobRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Runs every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void scanAndDispatchReminders() {
        checkOaReminders();
        checkInterviewReminders();
    }

    private void checkOaReminders() {
        List<JobApplication> jobs = jobRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (JobApplication job : jobs) {
            if (job.getOaEventDate() == null || job.getOaReminders() == null || job.getOaReminders().isEmpty()) {
                continue;
            }

            try {
                LocalDateTime eventTime = LocalDateTime.parse(job.getOaEventDate());
                if (eventTime.isBefore(now)) continue; // Already passed

                User user = job.getUserId() != null ? userRepository.findById(job.getUserId()).orElse(null) : null;
                if (user == null || user.getEmail() == null) continue;

                for (String reminderTag : job.getOaReminders()) {
                    long minutesBefore = parseReminderToMinutes(reminderTag);
                    if (minutesBefore < 0) continue;

                    LocalDateTime reminderTriggerTime = eventTime.minusMinutes(minutesBefore);
                    // If trigger time has arrived (within the last 15 minutes window) and not yet sent
                    if (!now.isBefore(reminderTriggerTime) && now.isBefore(reminderTriggerTime.plusMinutes(15))) {
                        String dispatchKey = "OA-" + job.getId() + "-" + reminderTag + "-" + job.getOaEventDate();
                        if (!dispatchedReminders.contains(dispatchKey)) {
                            dispatchedReminders.add(dispatchKey);
                            String readableTime = eventTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a"));
                            emailService.sendReminderEmail(
                                    user.getEmail(),
                                    "Reminder: Upcoming Online Assessment for " + job.getCompany(),
                                    "Upcoming Online Assessment (" + reminderTag + " ahead)",
                                    job.getCompany(),
                                    job.getRole(),
                                    readableTime,
                                    job.getOaNotes(),
                                    job.getOaPlatform()
                            );
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors for non-standard formats
            }
        }
    }

    private void checkInterviewReminders() {
        List<Interview> interviews = interviewRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Interview interview : interviews) {
            if (interview.getInterviewDate() == null || interview.getReminders() == null || interview.getReminders().isEmpty()) {
                continue;
            }

            if (interview.getInterviewDate().isBefore(today)) continue;

            JobApplication job = jobRepository.findById(interview.getJobApplicationId()).orElse(null);
            if (job == null) continue;

            User user = job.getUserId() != null ? userRepository.findById(job.getUserId()).orElse(null) : null;
            if (user == null || user.getEmail() == null) continue;

            for (String reminderTag : interview.getReminders()) {
                long daysBefore = parseReminderToDays(reminderTag);
                if (daysBefore < 0) continue;

                LocalDate triggerDate = interview.getInterviewDate().minusDays(daysBefore);
                if (today.isEqual(triggerDate)) {
                    String dispatchKey = "INT-" + interview.getId() + "-" + reminderTag + "-" + interview.getInterviewDate();
                    if (!dispatchedReminders.contains(dispatchKey)) {
                        dispatchedReminders.add(dispatchKey);
                        String timeDisplay = interview.getInterviewDate().toString() +
                                (interview.getInterviewTime() != null && !interview.getInterviewTime().isBlank()
                                        ? " at " + interview.getInterviewTime() : "");
                        emailService.sendReminderEmail(
                                user.getEmail(),
                                "Reminder: " + interview.getRound() + " with " + job.getCompany(),
                                "Upcoming Interview Round (" + reminderTag + " ahead)",
                                job.getCompany(),
                                job.getRole() + " - " + interview.getRound(),
                                timeDisplay,
                                interview.getNotes(),
                                interview.getMeetingLink()
                        );
                    }
                }
            }
        }
    }

    private long parseReminderToMinutes(String tag) {
        if ("30m".equalsIgnoreCase(tag)) return 30;
        if ("1h".equalsIgnoreCase(tag)) return 60;
        if ("1d".equalsIgnoreCase(tag)) return 1440;
        if ("2d".equalsIgnoreCase(tag)) return 2880;
        if ("3d".equalsIgnoreCase(tag)) return 4320;
        if ("1w".equalsIgnoreCase(tag)) return 10080;
        return -1;
    }

    private long parseReminderToDays(String tag) {
        if ("1d".equalsIgnoreCase(tag)) return 1;
        if ("2d".equalsIgnoreCase(tag)) return 2;
        if ("3d".equalsIgnoreCase(tag)) return 3;
        if ("1w".equalsIgnoreCase(tag)) return 7;
        if ("1h".equalsIgnoreCase(tag) || "30m".equalsIgnoreCase(tag)) return 0; // Same day
        return -1;
    }
}
