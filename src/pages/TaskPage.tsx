import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { TASK_STATUS_LABELS, PRIORITY_LABELS, type TaskStatus } from '../types';
import TaskFormModal from '../components/TaskFormModal';

interface Props { taskId: string; onBack: () => void; }

export default function TaskPage({ taskId, onBack }: Props) {
  const { user } = useApp();
  const task = api.getTask(taskId);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [, forceRender] = useState(0);

  if (!task) return <div className="empty-state"><p>Задача не найдена</p></div>;

  const project = api.getProject(task.projectId);
  const assignee = task.assigneeId ? api.getUser(task.assigneeId) : null;
  const author = api.getUser(task.authorId);
  const comments = api.getCommentsByTask(taskId);
  const history = api.getHistoryByTask(taskId);
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
  const canEdit = user!.role === 'admin' || user!.role === 'project_lead' || task.authorId === user!.id || task.assigneeId === user!.id;
  const canDelete = user!.role === 'admin' || user!.role === 'project_lead' || task.authorId === user!.id;

  const handleStatusChange = (newStatus: TaskStatus) => {
    api.updateTaskStatus(taskId, newStatus, user!.id);
    forceRender(n => n + 1);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    api.addComment({ taskId, authorId: user!.id, text: commentText });
    setCommentText('');
    forceRender(n => n + 1);
  };

  const handleEditComment = (id: string) => {
    api.updateComment(id, editText);
    setEditingComment(null);
    forceRender(n => n + 1);
  };

  const handleDeleteComment = (id: string) => {
    if (confirm('Удалить комментарий?')) {
      api.deleteComment(id);
      forceRender(n => n + 1);
    }
  };

  const handleDelete = () => {
    if (confirm('Удалить задачу?')) {
      api.deleteTask(taskId);
      onBack();
    }
  };

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>&larr; Назад</button>

      <div className="task-detail">
        <div className="task-detail-main">
          <div className="task-description">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <h3 style={{ flex: 1 }}>NDF-{task.number} {task.title}</h3>
              <span className={`badge badge-${task.status}`}>{TASK_STATUS_LABELS[task.status]}</span>
              <span className={`badge badge-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
              {isOverdue && <span className="badge badge-critical">Просрочено</span>}
            </div>
            {canEdit && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowEdit(true)}>Редактировать</button>
                {canDelete && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={handleDelete}>Удалить</button>}
              </div>
            )}
            <p>{task.description || 'Описание отсутствует.'}</p>
            {task.tags.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {task.tags.map(t => <span key={t} className="badge badge-backlog">#{t}</span>)}
              </div>
            )}
          </div>

          {canEdit && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 6, display: 'block' }}>Сменить статус</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['backlog', 'planned', 'in_progress', 'in_review', 'done'] as const).map(s => (
                  <button key={s} className={`btn btn-sm ${task.status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleStatusChange(s)} disabled={task.status === s}>{TASK_STATUS_LABELS[s]}</button>
                ))}
              </div>
            </div>
          )}

          <div className="comments-section">
            <h3>Комментарии ({comments.length})</h3>
            {comments.map(c => {
              const cAuthor = api.getUser(c.authorId);
              const canManage = c.authorId === user!.id || user!.role === 'admin';
              return (
                <div key={c.id} className="comment">
                  <div className="avatar">{cAuthor ? cAuthor.firstName[0] + cAuthor.lastName[0] : '?'}</div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{cAuthor ? `${cAuthor.firstName} ${cAuthor.lastName}` : 'Удалён'}</span>
                      <span className="comment-date">{new Date(c.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                    {editingComment === c.id ? (
                      <div style={{ marginTop: 4 }}>
                        <textarea className="form-input" rows={2} value={editText} onChange={e => setEditText(e.target.value)} />
                        <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleEditComment(c.id)}>Сохранить</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingComment(null)}>Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-text">{c.text}</p>
                    )}
                    {canManage && editingComment !== c.id && (
                      <div className="comment-actions">
                        {c.authorId === user!.id && <button onClick={() => { setEditingComment(c.id); setEditText(c.text); }}>Редактировать</button>}
                        <button onClick={() => handleDeleteComment(c.id)}>Удалить</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="comment-form">
              <textarea placeholder="Напишите комментарий..." value={commentText} onChange={e => setCommentText(e.target.value)} />
              <button className="btn btn-primary btn-sm" onClick={handleAddComment} style={{ alignSelf: 'flex-end' }}>Отправить</button>
            </div>
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>История изменений</h3>
              {history.map(h => {
                const hUser = api.getUser(h.userId);
                const fieldLabels: Record<string, string> = { status: 'статус', assignee: 'исполнителя', deadline: 'дедлайн', priority: 'приоритет' };
                return (
                  <div key={h.id} className="history-item">
                    <div className="history-icon">&#9998;</div>
                    <div className="history-text">
                      <strong>{hUser ? `${hUser.firstName} ${hUser.lastName}` : '—'}</strong> изменил(а) {fieldLabels[h.field] || h.field}
                      {h.oldValue && <> с «{h.oldValue}»</>}
                      {h.newValue && <> на «{h.newValue}»</>}
                    </div>
                    <span className="history-date">{new Date(h.createdAt).toLocaleString('ru-RU')}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="task-detail-sidebar">
          <div className="sidebar-section">
            <h4>Детали</h4>
            <div className="sidebar-row"><span className="label">Проект</span><span className="value">{project?.name || '—'}</span></div>
            <div className="sidebar-row"><span className="label">Исполнитель</span><span className="value">{assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Не назначен'}</span></div>
            <div className="sidebar-row"><span className="label">Постановщик</span><span className="value">{author ? `${author.firstName} ${author.lastName}` : '—'}</span></div>
            <div className="sidebar-row"><span className="label">Создано</span><span className="value">{new Date(task.createdAt).toLocaleDateString('ru-RU')}</span></div>
            <div className="sidebar-row"><span className="label">Обновлено</span><span className="value">{new Date(task.updatedAt).toLocaleDateString('ru-RU')}</span></div>
            <div className="sidebar-row"><span className="label">Дедлайн</span><span className={`value ${isOverdue ? 'overdue' : ''}`}>{task.deadline ? new Date(task.deadline).toLocaleDateString('ru-RU') : 'Не установлен'}</span></div>
          </div>

          {task.attachments.length > 0 && (
            <div className="sidebar-section">
              <h4>Вложения</h4>
              {task.attachments.map(a => (
                <div key={a.id} style={{ padding: '6px 0', fontSize: 13 }}>{a.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && <TaskFormModal taskId={taskId} onClose={() => { setShowEdit(false); forceRender(n => n + 1); }} />}
    </div>
  );
}
