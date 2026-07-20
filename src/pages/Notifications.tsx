import { useApp } from '../context/AppContext';
import * as api from '../api';

interface Props { onNavigate?: (p: any) => void; }

export default function NotificationsPage({ onNavigate }: Props) {
  const { user } = useApp();
  const notifications = api.getNotificationsByUser(user!.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unread = notifications.filter(n => !n.read).length;

  const handleMarkAll = () => {
    api.markAllNotificationsRead(user!.id);
    window.location.reload();
  };

  const handleClick = (n: typeof notifications[0]) => {
    api.markNotificationRead(n.id);
    if (n.taskId && onNavigate) {
      onNavigate({ type: 'task', id: n.taskId });
    } else {
      window.location.reload();
    }
  };

  const iconMap: Record<string, string> = {
    task_assigned: '&#128100;',
    status_changed: '&#9881;',
    new_comment: '&#128172;',
    deadline_approaching: '&#9200;',
    overdue: '&#9888;',
    deadline_changed: '&#128197;',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="page-title">Уведомления</h1>
        {unread > 0 && <button className="btn btn-secondary btn-sm" onClick={handleMarkAll}>Прочитать все</button>}
      </div>
      <p className="page-subtitle">{unread} непрочитанных из {notifications.length}</p>

      <div className="notification-list">
        {notifications.map(n => (
          <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`} onClick={() => handleClick(n)}>
            <div className={`notification-icon ${n.type}`} dangerouslySetInnerHTML={{ __html: iconMap[n.type] || '&#128276;' }} />
            <div className="notification-content">
              <div className="notification-text">{n.message}</div>
              <div className="notification-time">{new Date(n.createdAt).toLocaleString('ru-RU')}</div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <div className="empty-state"><div className="icon">&#128276;</div><p>Нет уведомлений</p></div>}
      </div>
    </div>
  );
}
