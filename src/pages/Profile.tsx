import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { ROLE_LABELS } from '../types';

export default function ProfilePage() {
  const { user, refresh, theme, setTheme } = useApp();
  const [firstName, setFirstName] = useState(user!.firstName);
  const [lastName, setLastName] = useState(user!.lastName);
  const [position, setPosition] = useState(user!.position);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    api.updateUser(user!.id, { firstName, lastName, position });
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw) return;
    if (currentPw !== user!.password) { alert('Неверный текущий пароль'); return; }
    api.updateUser(user!.id, { password: newPw });
    setCurrentPw('');
    setNewPw('');
    alert('Пароль изменён');
  };

  const initials = (firstName[0] || '') + (lastName[0] || '');

  return (
    <div>
      <h1 className="page-title">Профиль</h1>
      <p className="page-subtitle">Настройки вашего аккаунта</p>

      <div className="profile-card">
        <div className="avatar-xl">{initials.toUpperCase()}</div>

        <div className="form-group">
          <label>Имя</label>
          <input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Фамилия</label>
          <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Должность</label>
          <input className="form-input" value={position} onChange={e => setPosition(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-input" value={user!.email} disabled />
        </div>
        <div className="form-group">
          <label>Роль</label>
          <input className="form-input" value={ROLE_LABELS[user!.role]} disabled />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSave}>{saved ? 'Сохранено!' : 'Сохранить'}</button>
        </div>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Изменить пароль</h3>
        <div className="form-group">
          <label>Текущий пароль</label>
          <input className="form-input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Новый пароль</label>
          <input className="form-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
        </div>
        <button className="btn btn-secondary" onClick={handleChangePassword}>Сменить пароль</button>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Тема интерфейса</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTheme('light')}>&#9728; Светлая</button>
          <button className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTheme('dark')}>&#9790; Тёмная</button>
        </div>
      </div>
    </div>
  );
}
