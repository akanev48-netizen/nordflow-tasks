import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { TASK_STATUS_LABELS, PRIORITY_LABELS, type TaskStatus, type Priority } from '../types';

interface Props { onNavigate: (id: string) => void; }

export default function MyTasks({ onNavigate }: Props) {
  const { user } = useApp();
  const allTasks = api.getTasksByAssignee(user!.id);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'board'>('list');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [, forceRender] = useState(0);

  const tasks = useMemo(() => {
    let result = allTasks;
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    if (overdueOnly) result = result.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');
    if (search) result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [allTasks, statusFilter, priorityFilter, overdueOnly, search]);

  const statuses = ['backlog', 'planned', 'in_progress', 'in_review', 'done'] as const;

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragEnd = () => setDraggedTask(null);

  const handleDrop = useCallback((targetStatus: TaskStatus) => {
    if (!draggedTask) return;
    const task = api.getTask(draggedTask);
    if (task && task.status !== targetStatus) {
      api.updateTaskStatus(draggedTask, targetStatus, user!.id);
    }
    setDraggedTask(null);
    forceRender(n => n + 1);
  }, [draggedTask, user]);

  return (
    <div>
      <h1 className="page-title">Мои задачи</h1>
      <p className="page-subtitle">{tasks.length} задач</p>

      <div className="filters-bar">
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="Поиск по названию..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-group">
          <label>Статус:</label>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
            <option value="all">Все</option>
            {statuses.map(s => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Приоритет:</label>
          <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)}>
            <option value="all">Все</option>
            {(['low', 'medium', 'high', 'critical'] as const).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={overdueOnly} onChange={e => setOverdueOnly(e.target.checked)} /> Только просроченные
        </label>
        <div style={{ marginLeft: 'auto' }}>
          <div className="filter-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Список</button>
            <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>Доска</button>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        tasks.length > 0 ? (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Задача</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Дедлайн</th>
                <th>Проект</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const project = api.getProject(t.projectId);
                const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
                return (
                  <tr key={t.id}>
                    <td className="task-title-cell" onClick={() => onNavigate(t.id)}>
                      <span className="task-number">NDF-{t.number}</span>{t.title}
                    </td>
                    <td><span className={`badge badge-${t.status}`}>{TASK_STATUS_LABELS[t.status]}</span></td>
                    <td><span className={`badge badge-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span></td>
                    <td className={isOverdue ? 'overdue' : ''}>{t.deadline ? new Date(t.deadline).toLocaleDateString('ru-RU') : '—'}</td>
                    <td>{project?.name || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div className="empty-state"><div className="icon">&#128203;</div><p>Задач не найдено</p></div>
      ) : (
        <div className="kanban-board">
          {statuses.map(status => {
            const colTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="kanban-column">
                <div className="kanban-column-header">
                  <h4>{TASK_STATUS_LABELS[status]}</h4>
                  <span className="count">{colTasks.length}</span>
                </div>
                <div
                  className="kanban-column-body"
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                  onDrop={e => { e.currentTarget.classList.remove('drag-over'); handleDrop(status); }}
                >
                  {colTasks.map(t => {
                    const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
                    const project = api.getProject(t.projectId);
                    return (
                      <div
                        key={t.id}
                        className={`kanban-card ${isOverdue ? 'overdue-card' : ''} ${draggedTask === t.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(t.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onNavigate(t.id)}
                      >
                        <div className="card-header">
                          <span className={`badge badge-${t.priority}`} style={{ fontSize: 10, padding: '2px 6px' }}>{PRIORITY_LABELS[t.priority]}</span>
                        </div>
                        <div className="card-title">NDF-{t.number} {t.title}</div>
                        <div className="card-footer">
                          <div className="card-meta">
                            {t.deadline && <span className={isOverdue ? 'overdue' : ''}>{new Date(t.deadline).toLocaleDateString('ru-RU')}</span>}
                            {project && <span>{project.name}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
