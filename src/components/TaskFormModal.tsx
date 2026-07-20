import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { TASK_STATUS_LABELS, PRIORITY_LABELS, PROJECT_STATUS_LABELS, type TaskStatus, type Priority, type ProjectStatus } from '../types';

interface Props { projectId?: string; taskId?: string; onClose: () => void; }

export default function TaskFormModal({ projectId, taskId, onClose }: Props) {
  const { user } = useApp();
  const existing = taskId ? api.getTask(taskId) : null;
  const projects = api.getProjects().filter(p => p.memberIds.includes(user!.id) || user!.role === 'admin');
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [pid, setPid] = useState(existing?.projectId || projectId || (projects[0]?.id || ''));
  const [status, setStatus] = useState<TaskStatus>(existing?.status || 'backlog');
  const [assigneeId, setAssigneeId] = useState(existing?.assigneeId || '');
  const [priority, setPriority] = useState<Priority>(existing?.priority || 'medium');
  const [deadline, setDeadline] = useState(existing?.deadline ? existing.deadline.split('T')[0] : '');
  const [tags, setTags] = useState(existing?.tags.join(', ') || '');

  const currentProject = projects.find(p => p.id === pid);
  const members = currentProject ? api.getUsers().filter(u => currentProject.memberIds.includes(u.id)) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pid) return;

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    if (existing) {
      const changes: string[] = [];
      if (existing.status !== status) {
        api.updateTaskStatus(existing.id, status, user!.id);
        changes.push('status');
      }
      if (existing.assigneeId !== assigneeId && assigneeId) {
        api.addHistory(existing.id, user!.id, 'assignee', existing.assigneeId, assigneeId);
        const newAssignee = api.getUser(assigneeId);
        if (newAssignee) api.createNotification(assigneeId, 'task_assigned', `Вам назначена задача «${title}»`, existing.id);
      }
      if (existing.deadline !== (deadline || null)) {
        api.addHistory(existing.id, user!.id, 'deadline', existing.deadline, deadline || null);
        if (existing.assigneeId && existing.assigneeId !== user!.id) {
          api.createNotification(existing.assigneeId, 'deadline_changed', `Дедлайн задачи «${title}» изменён`, existing.id);
        }
      }
      api.updateTask(existing.id, { title, description, projectId: pid, assigneeId: assigneeId || null, priority, deadline: deadline || null, tags: tagList });
    } else {
      const task = api.createTask({ title, description, status, priority, projectId: pid, assigneeId: assigneeId || null, authorId: user!.id, deadline: deadline || null, tags: tagList, attachments: [] });
      api.addHistory(task.id, user!.id, 'status', null, status);
      if (assigneeId) {
        api.addHistory(task.id, user!.id, 'assignee', null, assigneeId);
        api.createNotification(assigneeId, 'task_assigned', `Вам назначена задача «${title}»`, task.id);
      }
    }
    onClose();
    window.location.reload();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{existing ? 'Редактировать задачу' : 'Создать задачу'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Название *</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Описание</label>
              <textarea className="form-input" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Проект *</label>
                <select className="form-select" value={pid} onChange={e => setPid(e.target.value)}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)}>
                  {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Исполнитель *</label>
                <select className="form-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">Не назначен</option>
                  {members.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Приоритет</label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Дедлайн</label>
                <input className="form-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Теги (через запятую)</label>
                <input className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="frontend, дизайн" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">{existing ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
