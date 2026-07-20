import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../types';

interface Props { projectId?: string; onClose: () => void; }

export default function ProjectFormModal({ projectId, onClose }: Props) {
  const { user } = useApp();
  const existing = projectId ? api.getProject(projectId) : null;
  const users = api.getUsers();
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [leadId, setLeadId] = useState(existing?.leadId || user!.id);
  const [members, setMembers] = useState<string[]>(existing?.memberIds || [user!.id]);
  const [startDate, setStartDate] = useState(existing?.startDate ? existing.startDate.split('T')[0] : '');
  const [endDate, setEndDate] = useState(existing?.endDate ? existing.endDate.split('T')[0] : '');
  const [status, setStatus] = useState<ProjectStatus>(existing?.status || 'planning');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (existing) {
      api.updateProject(existing.id, { name, description, leadId, memberIds: members, startDate: startDate || null, endDate: endDate || null, status });
    } else {
      api.createProject({ name, description, status, leadId, memberIds: members, startDate: startDate || null, endDate: endDate || null });
    }
    onClose();
    window.location.reload();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{existing ? 'Редактировать проект' : 'Создать проект'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Название *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Описание</label>
              <textarea className="form-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Руководитель</label>
              <select className="form-select" value={leadId} onChange={e => setLeadId(e.target.value)}>
                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Участники</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {users.map(u => (
                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: members.includes(u.id) ? 'var(--accent-light)' : 'transparent' }}>
                    <input type="checkbox" checked={members.includes(u.id)} onChange={e => setMembers(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))} style={{ display: 'none' }} />
                    {u.firstName} {u.lastName}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Дата начала</label>
                <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Дата завершения</label>
                <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Статус</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)}>
                {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
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
