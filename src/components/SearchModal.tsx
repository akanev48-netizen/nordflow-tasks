import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { TASK_STATUS_LABELS } from '../types';

interface Props { onClose: () => void; onNavigate: (type: string, id?: string) => void; }

export default function SearchModal({ onClose, onNavigate }: Props) {
  const { user } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ tasks: any[]; projects: any[]; users: any[] }>({ tasks: [], projects: [], users: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.length < 2) { setResults({ tasks: [], projects: [], users: [] }); return; }
    const r = api.search(query, user!.id, user!.role);
    setResults(r);
  }, [query, user]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500, marginTop: '-10vh' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: 16 }}>
          <input
            ref={inputRef}
            className="form-input"
            placeholder="Поиск задач, проектов, людей..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ fontSize: 16 }}
          />
        </div>
        <div className="search-results" style={{ maxHeight: 400, overflowY: 'auto' }}>
          {results.tasks.length > 0 && (
            <>
              <h4>Задачи</h4>
              {results.tasks.slice(0, 5).map(t => (
                <div key={t.id} className="search-result-item" onClick={() => onNavigate('task', t.id)}>
                  <span>&#128203;</span>
                  <div>
                    <div>NDF-{t.number} {t.title}</div>
                    <div className="result-type">{TASK_STATUS_LABELS[t.status as keyof typeof TASK_STATUS_LABELS]}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          {results.projects.length > 0 && (
            <>
              <h4>Проекты</h4>
              {results.projects.slice(0, 3).map(p => (
                <div key={p.id} className="search-result-item" onClick={() => onNavigate('project', p.id)}>
                  <span>&#128194;</span>
                  <div>
                    <div>{p.name}</div>
                    <div className="result-type">{p.description?.slice(0, 60)}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          {results.users.length > 0 && (
            <>
              <h4>Люди</h4>
              {results.users.slice(0, 5).map(u => (
                <div key={u.id} className="search-result-item">
                  <span>&#128100;</span>
                  <div>
                    <div>{u.firstName} {u.lastName}</div>
                    <div className="result-type">{u.position}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          {query.length >= 2 && results.tasks.length === 0 && results.projects.length === 0 && results.users.length === 0 && (
            <div className="empty-state" style={{ padding: 30 }}><p>Ничего не найдено</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
