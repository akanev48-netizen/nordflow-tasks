import { useApp } from '../context/AppContext';
import * as api from '../api';
import { TASK_STATUS_LABELS, type Task, type Project } from '../types';

interface Props { onNavigate: (p: any) => void; }

export default function Dashboard({ onNavigate }: Props) {
  const { user } = useApp();
  const myTasks = api.getTasksByAssignee(user!.id);
  const activeTasks = myTasks.filter(t => t.status !== 'done');
  const overdueTasks = myTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');
  const thisWeek = myTasks.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    const d = new Date(t.deadline);
    const now = new Date();
    const end = new Date(now); end.setDate(end.getDate() + 7);
    return d >= now && d <= end;
  });
  const projects = api.getProjects().filter(p => p.memberIds.includes(user!.id));
  const recentTasks = [...api.getTasks()].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div>
      <h1 className="page-title">Главная</h1>
      <p className="page-subtitle">Добро пожаловать, {user!.firstName}!</p>

      <div className="stats-grid">
        <div className="stat-card info">
          <div className="stat-label">Активные задачи</div>
          <div className="stat-value">{activeTasks.length}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Просроченные</div>
          <div className="stat-value">{overdueTasks.length}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">До конца недели</div>
          <div className="stat-value">{thisWeek.length}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Мои проекты</div>
          <div className="stat-value">{projects.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Ближайшие дедлайны</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeTasks.filter(t => t.deadline).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()).slice(0, 5).map(t => {
              const isOverdue = new Date(t.deadline!) < new Date();
              return (
                <div key={t.id} className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => onNavigate({ type: 'task', id: t.id })}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="task-number">NDF-{t.number}</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{t.title}</span>
                    </div>
                    <span className={`badge badge-${t.priority}`}>{t.priority === 'critical' ? 'Крит.' : t.priority === 'high' ? 'Выс.' : t.priority === 'medium' ? 'Ср.' : 'Низ.'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
                    {TASK_STATUS_LABELS[t.status]} &middot; <span className={isOverdue ? 'overdue' : ''}>Дедлайн: {new Date(t.deadline!).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              );
            })}
            {activeTasks.filter(t => t.deadline).length === 0 && <div className="empty-state"><p>Нет задач с дедлайнами</p></div>}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Мои проекты</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projects.map(p => {
              const tasks = api.getTasksByProject(p.id);
              const open = tasks.filter(t => t.status !== 'done').length;
              return (
                <div key={p.id} className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => onNavigate({ type: 'project', id: p.id })}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                    <span className={`badge badge-${p.status}`}>{p.status === 'active' ? 'Активный' : p.status === 'planning' ? 'Планируется' : p.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {open} открытых задач &middot; {p.memberIds.length} участников
                  </div>
                </div>
              );
            })}
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Последние обновления</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTasks.map(t => (
              <div key={t.id} className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => onNavigate({ type: 'task', id: t.id })}>
                <div style={{ fontSize: 13, fontWeight: 500 }}><span className="task-number">NDF-{t.number}</span>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{TASK_STATUS_LABELS[t.status]} &middot; Обновлено: {new Date(t.updatedAt).toLocaleDateString('ru-RU')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
