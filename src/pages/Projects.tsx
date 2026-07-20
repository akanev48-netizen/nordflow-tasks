import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../types';
import ProjectFormModal from '../components/ProjectFormModal';

interface Props { onNavigate: (id: string) => void; }

export default function ProjectsPage({ onNavigate }: Props) {
  const { user } = useApp();
  const [projects, setProjects] = useState(api.getProjects().filter(p => p.memberIds.includes(user!.id) || user!.role === 'admin'));
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = statusFilter === 'all' ? projects : projects.filter(p => p.status === statusFilter);

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Архивировать проект?')) {
      api.updateProject(id, { status: 'archived' });
      setProjects(api.getProjects().filter(p => p.memberIds.includes(user!.id) || user!.role === 'admin'));
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить проект и все его задачи?')) {
      api.deleteProject(id);
      setProjects(api.getProjects().filter(p => p.memberIds.includes(user!.id) || user!.role === 'admin'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="page-title">Проекты</h1>
        {user!.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Создать проект</button>
        )}
      </div>
      <p className="page-subtitle">{projects.length} проектов</p>

      <div className="filters-bar">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">Все статусы</option>
          {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="projects-grid">
        {filtered.map(p => {
          const tasks = api.getTasksByProject(p.id);
          const openTasks = tasks.filter(t => t.status !== 'done').length;
          const lead = api.getUser(p.leadId);
          return (
            <div key={p.id} className="project-card" onClick={() => onNavigate(p.id)}>
              <div className="project-header">
                <h3>{p.name}</h3>
                <span className={`badge badge-${p.status}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
              </div>
              <div className="project-desc">{p.description}</div>
              <div className="project-meta">
                <span>&#128100; {lead ? `${lead.firstName} ${lead.lastName}` : '—'}</span>
                <span>&#128203; {openTasks} задач</span>
                <span>&#9679; {p.memberIds.length} чел.</span>
                {p.endDate && <span>&#128197; {new Date(p.endDate).toLocaleDateString('ru-RU')}</span>}
              </div>
              {user!.role === 'admin' && (
                <div style={{ display: 'flex', gap: 6, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setEditId(p.id); }}>Редактировать</button>
                  {p.status !== 'archived' && <button className="btn btn-ghost btn-sm" onClick={(e) => handleArchive(p.id, e)}>Архивировать</button>}
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={(e) => handleDelete(p.id, e)}>Удалить</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && <ProjectFormModal onClose={() => setShowForm(false)} />}
      {editId && <ProjectFormModal projectId={editId} onClose={() => { setEditId(null); setProjects(api.getProjects().filter(p => p.memberIds.includes(user!.id) || user!.role === 'admin')); }} />}
    </div>
  );
}
