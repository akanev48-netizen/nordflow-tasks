import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import Dashboard from '../pages/Dashboard';
import MyTasks from '../pages/MyTasks';
import ProjectsPage from '../pages/Projects';
import ProjectPage from '../pages/ProjectPage';
import TaskPage from '../pages/TaskPage';
import TeamPage from '../pages/Team';
import NotificationsPage from '../pages/Notifications';
import ProfilePage from '../pages/Profile';
import AdminUsersPage from '../pages/AdminUsers';
import SearchModal from './SearchModal';

type Page =
  | { type: 'dashboard' }
  | { type: 'my-tasks' }
  | { type: 'projects' }
  | { type: 'project'; id: string }
  | { type: 'task'; id: string }
  | { type: 'team' }
  | { type: 'notifications' }
  | { type: 'profile' }
  | { type: 'admin-users' };

export default function Layout() {
  const { user, logout, sidebarOpen, setSidebarOpen } = useApp();
  const [page, setPage] = useState<Page>({ type: 'dashboard' });
  const [history, setHistory] = useState<Page[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = api.getNotificationsByUser(user!.id).filter(n => !n.read).length;
    setUnreadCount(count);
  }, [user, page]);

  const navigate = (p: Page) => { setHistory(h => [...h, page]); setPage(p); setSidebarOpen(false); };
  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setPage(prev);
      setSidebarOpen(false);
    } else {
      setPage({ type: 'dashboard' });
    }
  };

  const initials = user ? (user.firstName[0] + user.lastName[0]).toUpperCase() : '';
  const nav = (type: Page['type'], id?: string) => () => navigate(id ? { type: type as any, id } as any : { type });

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo_icon.jpg?v=2" alt="NordFlow" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
            <h2>NordFlow Tasks</h2>
          </div>
          <div className="role-badge">{api.getUser(user!.id)?.role === 'admin' ? 'Администратор' : api.getUser(user!.id)?.role === 'project_lead' ? 'Руководитель' : 'Сотрудник'}</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Основное</div>
          <a className={`nav-link ${page.type === 'dashboard' ? 'active' : ''}`} onClick={nav('dashboard')}>
            <span className="icon">&#9632;</span> Главная
          </a>
          <a className={`nav-link ${page.type === 'my-tasks' ? 'active' : ''}`} onClick={nav('my-tasks')}>
            <span className="icon">&#9998;</span> Мои задачи
          </a>
          <a className={`nav-link ${page.type === 'projects' || page.type === 'project' ? 'active' : ''}`} onClick={nav('projects')}>
            <span className="icon">&#9633;</span> Проекты
          </a>
          <a className={`nav-link ${page.type === 'team' ? 'active' : ''}`} onClick={nav('team')}>
            <span className="icon">&#9679;</span> Команда
          </a>
          <div className="nav-section">Уведомления</div>
          <a className={`nav-link ${page.type === 'notifications' ? 'active' : ''}`} onClick={nav('notifications')}>
            <span className="icon">&#9883;</span> Уведомления
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </a>
          <div className="nav-section">Настройки</div>
          <a className={`nav-link ${page.type === 'profile' ? 'active' : ''}`} onClick={nav('profile')}>
            <span className="icon">&#9881;</span> Профиль
          </a>
          {user!.role === 'admin' && (
            <a className={`nav-link ${page.type === 'admin-users' ? 'active' : ''}`} onClick={nav('admin-users')}>
              <span className="icon">&#9881;</span> Пользователи
            </a>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={nav('profile')}>
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user!.firstName} {user!.lastName}</div>
              <div className="user-email">{user!.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: 8 }} onClick={logout}>Выйти</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>&#9776;</button>
          <div className="header-search" onClick={() => setSearchOpen(true)}>
            <span className="search-icon">&#128269;</span>
            <input type="text" placeholder="Поиск задач, проектов, людей..." readOnly />
          </div>
          <div className="header-actions">
            <button className="header-btn" onClick={nav('notifications')}>
              &#128276;
              {unreadCount > 0 && <span className="notif-badge"></span>}
            </button>
            <button className="header-btn" onClick={nav('profile')}>&#128100;</button>
          </div>
        </header>

        <div className="page-container">
          {page.type === 'dashboard' && <Dashboard onNavigate={(p) => navigate(p)} />}
          {page.type === 'my-tasks' && <MyTasks onNavigate={(id) => navigate({ type: 'task', id })} />}
          {page.type === 'projects' && <ProjectsPage onNavigate={(id) => navigate({ type: 'project', id })} />}
          {page.type === 'project' && <ProjectPage projectId={page.id} onNavigate={(p) => navigate(p)} onBack={goBack} />}
          {page.type === 'task' && <TaskPage taskId={page.id} onBack={goBack} />}
          {page.type === 'team' && <TeamPage onNavigate={(p) => navigate(p)} />}
          {page.type === 'notifications' && <NotificationsPage onNavigate={(p) => navigate(p)} />}
          {page.type === 'profile' && <ProfilePage />}
          {page.type === 'admin-users' && <AdminUsersPage />}
        </div>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onNavigate={(type, id) => {
        setSearchOpen(false);
        if (type === 'task' && id) navigate({ type: 'task', id });
        else if (type === 'project' && id) navigate({ type: 'project', id });
      }} />}
    </div>
  );
}
