import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = login(email, password);
    if (err) setError(err);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <img src="/logo_main.jpg" alt="NordFlow" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
          <h1>NordFlow Tasks</h1>
        </div>
        <p className="subtitle">Войдите в свой аккаунт</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Электронная почта</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@nordflow.ru"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <div className="password-wrapper">
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Введите пароль"
                required
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>
                {showPw ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">Войти</button>
        </form>
        <div className="login-footer">
          Демо-данные загружаются автоматически.<br />
          Используйте любую электронную почту из списка / пароль: 123456
        </div>
      </div>
    </div>
  );
}
