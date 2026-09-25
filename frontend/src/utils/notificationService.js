// Browser Web Push & Desktop Notifications Service with Audio Alerts

class NotificationService {
  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermissionStatus() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Web Notifications are not supported in this browser.');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  }

  // Play a pleasant two-tone chime via Web Audio API without needing external sound files
  playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // First tone (587 Hz = D5), smooth glide to second tone (880 Hz = A5)
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // Audio playback may require initial user interaction on some browsers
    }
  }

  showNotification(title, options = {}) {
    this.playChime();

    if (!this.isSupported) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const defaultOptions = {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        silent: false,
        requireInteraction: true,
        ...options,
      };

      const notification = new Notification(title, defaultOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (err) {
      console.error('Failed to trigger desktop notification:', err);
      return null;
    }
  }

  // Dispatch high-information event alert
  notifyEvent({ type, role, company, timeDisplay, platform, notes, meetingLink, tagHuman }) {
    const title = `🔔 ${type} Reminder (${tagHuman}): ${role} @ ${company}`;
    
    const bodyLines = [
      `⏰ When: ${timeDisplay}`,
      platform ? `🌐 Platform: ${platform}` : null,
      meetingLink ? `🔗 Link: ${meetingLink}` : null,
      notes ? `📝 Notes: ${notes}` : null,
    ].filter(Boolean).join('\n');

    return this.showNotification(title, {
      body: bodyLines,
      tag: `trackr-${type}-${company}-${role}-${timeDisplay}`,
    });
  }

  // Trigger test reminder for user confirmation
  triggerTestReminder() {
    return this.notifyEvent({
      type: 'Test Alert',
      role: 'Software Engineer',
      company: 'Trackr Live Notifications',
      timeDisplay: 'Right Now (Test)',
      platform: 'Desktop Push & Audio Active',
      notes: 'Browser notifications are working properly! You will receive timely alerts for your scheduled OAs and Interviews.',
      tagHuman: 'Test Passed',
    });
  }
}

export const notificationService = new NotificationService();
