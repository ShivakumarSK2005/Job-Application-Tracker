package com.jobtracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    // Optional autowiring so application works smoothly even if SMTP properties aren't configured yet
    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendReminderEmail(String toEmail, String subject, String title, String company, String role, String eventTime, String notes, String link) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Cannot send email: recipient address is empty.");
            return false;
        }

        if (mailSender == null) {
            log.info("===> [SIMULATED EMAIL REMINDER] To: {} | Subject: {} | Event: {} for {} - {} | Time: {} | Link: {} | Notes: {}",
                    toEmail, subject, title, company, role, eventTime, link, notes);
            log.warn("[EMAIL NOTICE] Email delivery was simulated. To send real emails, configure SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD in your Render environment variables.");
            return true;
        }

        try {
            String htmlContent = buildHtmlTemplate(title, company, role, eventTime, notes, link);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Reminder email successfully sent to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send reminder email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private String buildHtmlTemplate(String title, String company, String role, String eventTime, String notes, String link) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px;\">");
        sb.append("<div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 20px;\">");
        sb.append("<div style=\"width: 32px; height: 32px; background-color: #4f46e5; border-radius: 8px; display: inline-block; vertical-align: middle; text-align: center; line-height: 32px; color: #ffffff; font-weight: bold;\">&#128188;</div>");
        sb.append("<span style=\"font-size: 16px; font-weight: 700; color: #18181b; vertical-align: middle; margin-left: 8px;\">JobTracker Alert</span>");
        sb.append("</div>");

        sb.append("<h2 style=\"font-size: 20px; font-weight: 700; color: #18181b; margin-top: 0; margin-bottom: 8px;\">").append(title).append("</h2>");
        sb.append("<p style=\"font-size: 14px; color: #52525b; margin-top: 0; margin-bottom: 20px;\">You have an upcoming milestone for your application:</p>");

        sb.append("<div style=\"background-color: #f4f4f5; border-radius: 12px; padding: 16px; margin-bottom: 20px;\">");
        sb.append("<div style=\"font-size: 15px; font-weight: 600; color: #18181b;\">").append(role).append("</div>");
        sb.append("<div style=\"font-size: 13px; color: #4f46e5; font-weight: 600; margin-top: 2px;\">@ ").append(company).append("</div>");
        sb.append("<div style=\"font-size: 13px; color: #71717a; margin-top: 8px;\">&#128337; <strong>Scheduled:</strong> ").append(eventTime).append("</div>");
        if (link != null && !link.isBlank()) {
            sb.append("<div style=\"font-size: 13px; color: #71717a; margin-top: 6px;\">&#128279; <strong>Link:</strong> <a href=\"").append(link).append("\" style=\"color: #4f46e5;\">").append(link).append("</a></div>");
        }
        sb.append("</div>");

        if (notes != null && !notes.isBlank()) {
            sb.append("<div style=\"background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 14px; margin-bottom: 20px;\">");
            sb.append("<div style=\"font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;\">Preparation & Mistakes Notes</div>");
            sb.append("<div style=\"font-size: 13px; color: #78350f; margin-top: 4px; line-height: 1.5;\">").append(notes).append("</div>");
            sb.append("</div>");
        }

        sb.append("<p style=\"font-size: 12px; color: #a1a1aa; margin-top: 24px; border-top: 1px solid #f4f4f5; padding-top: 16px;\">Best of luck with your preparation!<br/>JobTracker Automated Notification System</p>");
        sb.append("</div>");
        return sb.toString();
    }
}
