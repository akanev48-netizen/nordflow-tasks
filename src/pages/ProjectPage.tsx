import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { TASK_STATUS_LABELS, PRIORITY_LABELS, PROJECT_STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '../types';
import TaskFormModal from '../components/TaskFormModal';
import ProjectFormModal from '../components/ProjectFormModal';

interface Props { projectId: string; onNavigate: (p: any) => void; onBack?: () => void; }

export default function ProjectPage({ projectId, onNavigate, onBack }: Props) {
  const { user } = useApp();
  const project = api.getProject(projectId);
  const [tab, setTab] = useState<'board' | 'list' | 'members' | 'info'>('board');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [, forceRender] = useState(0);

  if (!project) return <div className="empty-state"><p>Проект не найден</p></div>;

  const tasks = api.getTasksByProject(projectId);
  const lead = api.getUser(project.leadId);
  const allUsers = api.getUsers();
  const nonMembers = allUsers.filter(u => !project.memberIds.includes(u.id));

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

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Удалить задачу?')) {
      api.deleteTask(taskId);
      forceRender(n => n + 1);
    }
  };

  const handleAddMember = (userId: string) => {
    api.updateProject(projectId, { memberIds: [...project.memberIds, userId] });
    forceRender(n => n + 1);
  };

  const handleRemoveMember = (userId: string) => {
    if (userId === project.leadId) { alert('Нельзя удалить руководителя проекта'); return; }
    api.updateProject(projectId, { memberIds: project.memberIds.filter(id => id !== userId) });
    forceRender(n => n + 1);
  };

  return (
    <div>
      {onBack && <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>&larr; Назад</button>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {user!.role === 'admin' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowEditProject(true)}>Редактировать проект</button>
          )}
          {(user!.role === 'admin' || user!.role === 'project_lead') && (
            <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>+ Задача</button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'board' ? 'active' : ''}`} onClick={() => setTab('board')}>Доска</button>
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>Список задач</button>
        <button className={`tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Участники</button>
        <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Информация</button>
      </div>

      {tab === 'board' && (
        <div className="kanban-board">
          {TASK_STATUSES.map(status => {
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
                    const assignee = t.assigneeId ? api.getUser(t.assigneeId) : null;
                    const commentCount = api.getCommentsByTask(t.id).length;
                    const canDelete = user!.role === 'admin' || user!.role === 'project_lead' || t.authorId === user!.id;
                    return (
                      <div
                        key={t.id}
                        className={`kanban-card ${isOverdue ? 'overdue-card' : ''} ${draggedTask === t.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(t.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="card-header">
                          <span className={`badge badge-${t.priority}`} style={{ fontSize: 10, padding: '2px 6px' }}>{PRIORITY_LABELS[t.priority]}</span>
                          {canDelete && <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: '0 4px', color: 'var(--text-tertiary)' }} onClick={(e) => { e.stopPropagation(); handleDeleteTask(t.id); }}>&times;</button>}
                        </div>
                        <div className="card-title" onClick={() => onNavigate({ type: 'task', id: t.id })}>NDF-{t.number} {t.title}</div>
                        <div className="card-footer">
                          <div className="card-meta">
                            {t.deadline && <span className={isOverdue ? 'overdue' : ''}>{new Date(t.deadline).toLocaleDateString('ru-RU')}</span>}
                            {commentCount > 0 && <span>&#128172; {commentCount}</span>}
                            {t.attachments.length > 0 && <span>&#128206;</span>}
                          </div>
                          {assignee && (
                            <div className="card-assignee" title={`${assignee.firstName} ${assignee.lastName}`}>
                              {assignee.firstName[0]}{assignee.lastName[0]}
                            </div>
                          )}
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

      {tab === 'list' && (
        tasks.length > 0 ? (
          <table className="tasks-table">
            <thead>
              <tr><th>Задача</th><th>Статус</th><th>Приоритет</th><th>Исполнитель</th><th>Дедлайн</th><th></th></tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const assignee = t.assigneeId ? api.getUser(t.assigneeId) : null;
                const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
                const canDelete = user!.role === 'admin' || user!.role === 'project_lead' || t.authorId === user!.id;
                return (
                  <tr key={t.id}>
                    <td className="task-title-cell" onClick={() => onNavigate({ type: 'task', id: t.id })}>
                      <span className="task-number">NDF-{t.number}</span>{t.title}
                    </td>
                    <td><span className={`badge badge-${t.status}`}>{TASK_STATUS_LABELS[t.status]}</span></td>
                    <td><span className={`badge badge-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span></td>
                    <td>{assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'}</td>
                    <td className={isOverdue ? 'overdue' : ''}>{t.deadline ? new Date(t.deadline).toLocaleDateString('ru-RU') : '—'}</td>
                    <td>{canDelete && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteTask(t.id)}>Удалить</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div className="empty-state"><div className="icon">&#128203;</div><p>В проекте пока нет задач</p></div>
      )}

      {tab === 'members' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Участники ({project.memberIds.length})</h3>
            <div className="team-grid">
              {project.memberIds.map(uid => {
                const u = api.getUser(uid);
                if (!u) return null;
                const memberTasks = api.getTasksByAssignee(uid).filter(t => t.projectId === projectId);
                const memberActiveTasks = memberTasks.filter(t => t.status !== 'done');
                const canRemove = user!.role === 'admin' && uid !== project.leadId;
                const isExpanded = selectedMemberId === uid;
                return (
                  <div key={uid} className="team-card" style={{ cursor: 'pointer', border: isExpanded ? '2px solid var(--primary)' : undefined }} onClick={() => setSelectedMemberId(isExpanded ? null : uid)}>
                    <div className="card-top">
                      <div className="avatar-lg">{u.firstName[0]}{u.lastName[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div className="team-name">{u.firstName} {u.lastName}</div>
                        <div className="team-position">{u.position}</div>
                      </div>
                    </div>
                    <div className="team-stats">
                      <span>&#128203; {memberActiveTasks.length} активных</span>
                      <span className={project.leadId === uid ? 'badge badge-active' : ''} style={{ fontSize: 11 }}>{project.leadId === uid ? 'Руководитель' : 'Участник'}</span>
                      {canRemove && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginLeft: 'auto' }} onClick={(e) => { e.stopPropagation(); handleRemoveMember(uid); }}>Удалить</button>}
                    </div>
                    {isExpanded && memberTasks.length > 0 && (
                      <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }} onClick={(e) => e.stopPropagation()}>
                        {memberTasks.map(t => {
                          const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
                          return (
                            <div key={t.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => onNavigate({ type: 'task', id: t.id })}>
                              <div>
                                <span className="task-number" style={{ marginRight: 6 }}>NDF-{t.number}</span>
                                <span>{t.title}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span className={`badge badge-${t.status}`} style={{ fontSize: 10 }}>{TASK_STATUS_LABELS[t.status]}</span>
                                {t.deadline && <span style={{ fontSize: 12, color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>{new Date(t.deadline).toLocaleDateString('ru-RU')}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {isExpanded && memberTasks.length === 0 && (
                      <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                        Нет задач в этом проекте
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {user!.role === 'admin' && nonMembers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Добавить участника</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {nonMembers.map(u => (
                  <button key={u.id} className="btn btn-secondary btn-sm" onClick={() => handleAddMember(u.id)}>
                    + {u.firstName} {u.lastName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'info' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="sidebar-row"><span className="label">Статус</span><span className="value"><span className={`badge badge-${project.status}`}>{PROJECT_STATUS_LABELS[project.status]}</span></span></div>
            <div className="sidebar-row"><span className="label">Руководитель</span><span className="value">{lead ? `${lead.firstName} ${lead.lastName}` : '—'}</span></div>
            <div className="sidebar-row"><span className="label">Участники</span><span className="value">{project.memberIds.length} чел.</span></div>
            <div className="sidebar-row"><span className="label">Дата начала</span><span className="value">{project.startDate ? new Date(project.startDate).toLocaleDateString('ru-RU') : '—'}</span></div>
            <div className="sidebar-row"><span className="label">Дата завершения</span><span className="value">{project.endDate ? new Date(project.endDate).toLocaleDateString('ru-RU') : '—'}</span></div>
            <div className="sidebar-row"><span className="label">Создан</span><span className="value">{new Date(project.createdAt).toLocaleDateString('ru-RU')}</span></div>
          </div>
        </div>
      )}

      {showTaskForm && <TaskFormModal projectId={projectId} onClose={() => setShowTaskForm(false)} />}
      {showEditProject && <ProjectFormModal projectId={projectId} onClose={() => setShowEditProject(false)} />}
    </div>
  );
}
