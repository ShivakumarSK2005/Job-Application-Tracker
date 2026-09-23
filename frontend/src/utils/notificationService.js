// Browser Web Push & Desktop Notifications Service

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

  showNotification(title, options = {}) {
    if (!this.isSupported) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const defaultOptions = {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        silent: false,
        ...options,
      };

      const notification = new Notification(title, defaultOptions);

      if (options.onClickUrl) {
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      return notification;
    } catch (err) {
      console.error('Failed to trigger desktop notification:', err);
      return null;
    }
  }

  // Trigger test reminder
  triggerTestReminder() {
    return this.showNotification('JobTracker Push Notification Active!', {
      body: 'You will receive desktop alerts for upcoming Online Assessments and Interview rounds.',
    });
  }
}

export const notificationService = new NotificationService();
