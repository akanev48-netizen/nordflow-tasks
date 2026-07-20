import { useState } from 'react';
import * as api from '../api';
import { ROLE_LABELS, type Role } from '../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(api.getUsers());
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const reload = () => setUsers(api.getUsers());

  const handleDelete = (id: string) => {
    if (confirm('Удалить пользователя?')) {
      api.deleteUser(id);
      reload();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="page-title">Управление пользователями</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Создать</button>
      </div>
      <p className="page-subtitle">{users.length} пользователей</p>

      <table className="tasks-table">
        <thead>
          <tr><th>Имя</th><th>Email</th><th>Должность</th><th>Роль</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.position}</td>
              <td><span className="badge badge-planned">{ROLE_LABELS[u.role]}</span></td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(editingId === u.id ? null : u.id)}>Роль</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(u.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingId && <RoleEditor userId={editingId} onClose={() => { setEditingId(null); reload(); }} />}
      {showCreate && <CreateUserModal onClose={() => { setShowCreate(false); reload(); }} />}
    </div>
  );
}

function RoleEditor({ userId, onClose }: { userId: string; onClose: () => void }) {
  const user = api.getUser(userId);
  const [role, setRole] = useState<Role>(user?.role || 'employee');
  if (!user) return null;

  const handleSave = () => {
    api.updateUser(userId, { role });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Роль: {user.firstName} {user.lastName}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Роль</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value as any)}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
        </div>
      </div>
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
          <h2>Создать пользователя</h2>
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
            <button type="submit" className="btn btn-primary">Создать</button>
          </div>
        </form>
      </div>
    </div>
  );
}
