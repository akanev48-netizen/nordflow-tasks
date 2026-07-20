import { useState } from 'react';
import * as api from '../api';
import { ROLE_LABELS, type Role, TASK_STATUS_LABELS, PRIORITY_LABELS } from '../types';
import { useApp } from '../context/AppContext';

interface Props { onNavigate?: (p: any) => void; }

export default function TeamPage({ onNavigate }: Props) {
  const { user } = useApp();
  const users = api.getUsers();
  const tasks = api.getTasks();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [, forceRender] = useState(0);

  const selected = selectedUser ? users.find(u => u.id === selectedUser) : null;
  const selectedTasks = selectedUser ? tasks.filter(t => t.assigneeId === selectedUser) : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="page-title">Команда</h1>
        {user!.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Сотрудник</button>
        )}
      </div>
      <p className="page-subtitle">{users.length} сотрудников</p>

      <div className="team-grid">
        {users.map(u => {
          const myTasks = tasks.filter(t => t.assigneeId === u.id && t.status !== 'done');
          const overdue = tasks.filter(t => t.assigneeId === u.id && t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');
          const loadPercent = Math.min(100, Math.round((myTasks.length / 10) * 100));
          return (
            <div key={u.id} className="team-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(u.id)}>
              <div className="card-top">
                <div className="avatar-lg">{u.firstName[0]}{u.lastName[0]}</div>
                <div style={{ flex: 1 }}>
                  <div className="team-name">{u.firstName} {u.lastName}</div>
                  <div className="team-position">{u.position}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{ROLE_LABELS[u.role]}</div>
                </div>
              </div>
              <div style={{ margin: '12px 0', background: 'var(--bg-tertiary)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${loadPercent}%`, height: '100%', background: loadPercent > 80 ? 'var(--danger)' : loadPercent > 50 ? 'var(--warning)' : 'var(--accent)', borderRadius: 4 }} />
              </div>
              <div className="team-stats">
                <span>&#128203; {myTasks.length} активных</span>
                <span className={overdue.length > 0 ? 'overdue' : ''}>&#9888; {overdue.length} просроченных</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>{u.email}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar-lg">{selected.firstName[0]}{selected.lastName[0]}</div>
                <div>
                  <h2>{selected.firstName} {selected.lastName}</h2>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.position} &middot; {ROLE_LABELS[selected.role]}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Все задачи ({selectedTasks.length})</h3>
              {selectedTasks.length > 0 ? (
                <table className="tasks-table">
                  <thead>
                    <tr><th>Задача</th><th>Статус</th><th>Приоритет</th><th>Дедлайн</th></tr>
                  </thead>
                  <tbody>
                    {selectedTasks.map(t => {
                      const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
                      return (
                        <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedUser(null); if (onNavigate) onNavigate({ type: 'task', id: t.id }); }}>
                          <td className="task-title-cell"><span className="task-number">NDF-{t.number}</span>{t.title}</td>
                          <td><span className={`badge badge-${t.status}`}>{TASK_STATUS_LABELS[t.status]}</span></td>
                          <td><span className={`badge badge-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span></td>
                          <td className={isOverdue ? 'overdue' : ''}>{t.deadline ? new Date(t.deadline).toLocaleDateString('ru-RU') : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: 20 }}><p>Нет задач</p></div>
              )}
            </div>
          </div>
        </div>
      )}
      {showCreate && <CreateUserModal onClose={() => { setShowCreate(false); forceRender(n => n + 1); }} />}
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) return;
    api.createUser({ email, password, firstName, lastName, role, position });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить сотрудника</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Имя *</label>
                <input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Фамилия *</label>
                <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Должность</label>
              <input className="form-input" value={position} onChange={e => setPosition(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Роль</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value as any)}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Пароль</label>
                <input className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
