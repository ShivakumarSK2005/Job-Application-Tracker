package com.jobtracker.service;

import com.jobtracker.model.Interview;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
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

    @Value("${app.timezone:Asia/Kolkata}")
    private String configuredTimezone;

    // In-memory cache of already dispatched reminders to prevent duplicate emails
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

    private ZoneId getAppZoneId() {
        try {
            return ZoneId.of(configuredTimezone);
        } catch (Exception e) {
            return ZoneId.of("Asia/Kolkata");
        }
    }

    // Runs every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void scanAndDispatchReminders() {
        ZoneId zoneId = getAppZoneId();
        LocalDateTime now = LocalDateTime.now(zoneId);
        checkOaReminders(now, zoneId);
        checkInterviewReminders(now, zoneId);
    }

    private void checkOaReminders(LocalDateTime now, ZoneId zoneId) {
        List<JobApplication> jobs = jobRepository.findAll();

        for (JobApplication job : jobs) {
            if (job.getOaEventDate() == null || job.getOaReminders() == null || job.getOaReminders().isEmpty()) {
                continue;
            }

            try {
                LocalDateTime eventTime = parseDateTime(job.getOaEventDate(), zoneId);
                if (eventTime == null || eventTime.isBefore(now)) continue; // Already passed

                User user = job.getUserId() != null ? userRepository.findById(job.getUserId()).orElse(null) : null;
                if (user == null || user.getEmail() == null || user.getEmail().isBlank()) continue;

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
                            String humanAhead = formatHumanAhead(reminderTag);
                            log.info("Dispatching OA reminder for job {} to {} (Trigger time reached: {})",
                                    job.getId(), user.getEmail(), readableTime);

                            emailService.sendReminderEmail(
                                    user.getEmail(),
                                    "🔔 Reminder: Upcoming Online Assessment for " + job.getCompany(),
                                    "Upcoming Online Assessment (" + humanAhead + ")",
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
                log.warn("Error processing OA reminder for job {}: {}", job.getId(), e.getMessage());
            }
        }
    }

    private void checkInterviewReminders(LocalDateTime now, ZoneId zoneId) {
        List<Interview> interviews = interviewRepository.findAll();
        LocalDate today = now.toLocalDate();

        for (Interview interview : interviews) {
            if (interview.getInterviewDate() == null || interview.getReminders() == null || interview.getReminders().isEmpty()) {
                continue;
            }

            if (interview.getInterviewDate().isBefore(today)) continue;

            JobApplication job = jobRepository.findById(interview.getJobApplicationId()).orElse(null);
            if (job == null) continue;

            User user = job.getUserId() != null ? userRepository.findById(job.getUserId()).orElse(null) : null;
            if (user == null || user.getEmail() == null || user.getEmail().isBlank()) continue;

            for (String reminderTag : interview.getReminders()) {
                boolean shouldTrigger = false;
                String timeDisplay = interview.getInterviewDate().toString();

                if ("30m".equalsIgnoreCase(reminderTag) || "1h".equalsIgnoreCase(reminderTag)) {
                    // Minute precision reminder when interviewTime is specified
                    if (interview.getInterviewTime() != null && !interview.getInterviewTime().isBlank()) {
                        try {
                            LocalTime time = LocalTime.parse(interview.getInterviewTime().trim());
                            LocalDateTime interviewTime = interview.getInterviewDate().atTime(time);
                            long minutesBefore = "30m".equalsIgnoreCase(reminderTag) ? 30 : 60;
                            LocalDateTime triggerTime = interviewTime.minusMinutes(minutesBefore);

                            if (!now.isBefore(triggerTime) && now.isBefore(triggerTime.plusMinutes(15))) {
                                shouldTrigger = true;
                                timeDisplay = interviewTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a"));
                            }
                        } catch (Exception ex) {
                            // If time format fails, fallback to day check
                            if (today.isEqual(interview.getInterviewDate())) {
                                shouldTrigger = true;
                            }
                        }
                    } else if (today.isEqual(interview.getInterviewDate())) {
                        shouldTrigger = true;
                    }
                } else {
                    // Day precision reminder (1d, 2d, 3d, 1w)
                    long daysBefore = parseReminderToDays(reminderTag);
                    if (daysBefore >= 0) {
                        LocalDate triggerDate = interview.getInterviewDate().minusDays(daysBefore);
                        if (today.isEqual(triggerDate)) {
                            shouldTrigger = true;
                            if (interview.getInterviewTime() != null && !interview.getInterviewTime().isBlank()) {
                                timeDisplay += " at " + interview.getInterviewTime();
                            }
                        }
                    }
                }

                if (shouldTrigger) {
                    String interviewTimeVal = interview.getInterviewTime() != null ? interview.getInterviewTime() : "";
                    String dispatchKey = "INT-" + interview.getId() + "-" + reminderTag + "-" + interview.getInterviewDate() + "-" + interviewTimeVal;
                    if (!dispatchedReminders.contains(dispatchKey)) {
                        dispatchedReminders.add(dispatchKey);
                        String humanAhead = formatHumanAhead(reminderTag);
                        log.info("Dispatching Interview reminder for {} to {}", interview.getRound(), user.getEmail());

                        emailService.sendReminderEmail(
                                user.getEmail(),
                                "🔔 Reminder: " + interview.getRound() + " with " + job.getCompany(),
                                "Upcoming Interview Round (" + humanAhead + ")",
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

    private LocalDateTime parseDateTime(String rawDate, ZoneId zoneId) {
        if (rawDate == null || rawDate.isBlank()) return null;
        try {
            // ISO instant with 'Z'
            if (rawDate.endsWith("Z")) {
                return Instant.parse(rawDate).atZone(zoneId).toLocalDateTime();
            }
            // ISO format with timezone offset e.g. +05:30
            if (rawDate.length() > 19 && (rawDate.charAt(19) == '+' || rawDate.charAt(19) == '-')) {
                return java.time.OffsetDateTime.parse(rawDate).atZoneSameInstant(zoneId).toLocalDateTime();
            }
            // Standard datetime-local string (e.g. 2026-09-25T18:43)
            if (rawDate.length() >= 16) {
                return LocalDateTime.parse(rawDate.substring(0, Math.min(rawDate.length(), 19)));
            }
            return LocalDateTime.parse(rawDate);
        } catch (Exception e) {
            log.debug("Could not parse date string '{}': {}", rawDate, e.getMessage());
            return null;
        }
    }

    private String formatHumanAhead(String tag) {
        if ("30m".equalsIgnoreCase(tag)) return "30 minutes ahead";
        if ("1h".equalsIgnoreCase(tag)) return "1 hour ahead";
        if ("1d".equalsIgnoreCase(tag)) return "1 day ahead";
        if ("2d".equalsIgnoreCase(tag)) return "2 days ahead";
        if ("3d".equalsIgnoreCase(tag)) return "3 days ahead";
        if ("1w".equalsIgnoreCase(tag)) return "1 week ahead";
        return tag;
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
        return -1;
    }
}
