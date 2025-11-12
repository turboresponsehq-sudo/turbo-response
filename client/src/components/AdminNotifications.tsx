import { useEffect, useState } from 'react';
import './AdminNotifications.css';

interface Notification {
  id: number;
  case_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        'https://turbo-response-backend.onrender.com/api/admin/consumer/notifications'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      'analysis_complete': '🤖',
      'letter_generated': '📄',
      'case_update': '📋',
      'urgent': '⚠️',
      'info': 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'analysis_complete': '#a855f7',
      'letter_generated': '#22c55e',
      'case_update': '#06b6d4',
      'urgent': '#ef4444',
      'info': '#3b82f6'
    };
    return colors[type] || '#94a3b8';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="admin-notifications">
        <div className="notifications-header">
          <h3>🔔 Notifications</h3>
        </div>
        <div className="notifications-loading">
          <div className="spinner-small"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      <div className="notifications-header">
        <h3>🔔 Notifications</h3>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      {error && (
        <div className="notifications-error">
          <p>❌ {error}</p>
          <button onClick={fetchNotifications} className="btn-retry">
            Retry
          </button>
        </div>
      )}

      {!error && notifications.length === 0 && (
        <div className="notifications-empty">
          <p>📭 No notifications</p>
        </div>
      )}

      {!error && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              style={{ borderLeftColor: getNotificationColor(notification.type) }}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-footer">
                  <span className="notification-time">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                  {notification.case_id && (
                    <a 
                      href={`/admin/consumer/case/${notification.case_id}`}
                      className="notification-link"
                    >
                      View Case →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="notifications-footer">
        <button onClick={fetchNotifications} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
