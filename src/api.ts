import type { User, Project, Task, Comment, Notification, TaskHistory, TaskStatus } from './types';
import { seedUsers, seedProjects, generateSeedTasks, generateSeedComments, generateSeedHistory, generateSeedNotifications } from './seed';

const KEYS = {
  users: 'ndf_users',
  projects: 'ndf_projects',
  tasks: 'ndf_tasks',
  comments: 'ndf_comments',
  notifications: 'ndf_notifications',
  history: 'ndf_history',
  initialized: 'ndf_initialized',
  currentUser: 'ndf_current_user',
};

function load<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function initializeData() {
  if (localStorage.getItem(KEYS.initialized)) return;
  save(KEYS.users, seedUsers);
  save(KEYS.projects, seedProjects);
  const tasks = generateSeedTasks();
  save(KEYS.tasks, tasks);
  save(KEYS.comments, generateSeedComments(tasks));
  save(KEYS.history, generateSeedHistory(tasks));
  save(KEYS.notifications, generateSeedNotifications());
  localStorage.setItem(KEYS.initialized, '1');
}

// Auth
export function login(email: string, password: string): User | null {
  const users = load<User>(KEYS.users);
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem(KEYS.currentUser, user.id);
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(KEYS.currentUser);
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.currentUser);
}

// Users
export function getUsers(): User[] { return load<User>(KEYS.users); }
export function getUser(id: string): User | undefined { return load<User>(KEYS.users).find(u => u.id === id); }
export function createUser(data: Omit<User, 'id' | 'avatar' | 'theme'>): User {
  const users = load<User>(KEYS.users);
  const user: User = { ...data, id: uid(), avatar: null, theme: 'light' };
  users.push(user);
  save(KEYS.users, users);
  return user;
}
export function updateUser(id: string, data: Partial<User>): User | null {
  const users = load<User>(KEYS.users);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  save(KEYS.users, users);
  return users[idx];
}
export function deleteUser(id: string) {
  const users = load<User>(KEYS.users).filter(u => u.id !== id);
  save(KEYS.users, users);
}

// Projects
export function getProjects(): Project[] { return load<Project>(KEYS.projects); }
export function getProject(id: string): Project | undefined { return load<Project>(KEYS.projects).find(p => p.id === id); }
export function createProject(data: Omit<Project, 'id' | 'createdAt'>): Project {
  const projects = load<Project>(KEYS.projects);
  const project: Project = { ...data, id: uid(), createdAt: new Date().toISOString() };
  projects.push(project);
  save(KEYS.projects, projects);
  return project;
}
export function updateProject(id: string, data: Partial<Project>): Project | null {
  const projects = load<Project>(KEYS.projects);
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...data };
  save(KEYS.projects, projects);
  return projects[idx];
}

// Tasks
export function getTasks(): Task[] { return load<Task>(KEYS.tasks); }
export function getTask(id: string): Task | undefined { return load<Task>(KEYS.tasks).find(t => t.id === id); }
export function getTasksByProject(projectId: string): Task[] { return load<Task>(KEYS.tasks).filter(t => t.projectId === projectId); }
export function getTasksByAssignee(userId: string): Task[] { return load<Task>(KEYS.tasks).filter(t => t.assigneeId === userId); }
export function createTask(data: Omit<Task, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Task {
  const tasks = load<Task>(KEYS.tasks);
  const maxNum = tasks.reduce((max, t) => Math.max(max, t.number), 0);
  const task: Task = { ...data, id: uid(), number: maxNum + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  tasks.push(task);
  save(KEYS.tasks, tasks);
  return task;
}
export function updateTask(id: string, data: Partial<Task>): Task | null {
  const tasks = load<Task>(KEYS.tasks);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
  save(KEYS.tasks, tasks);
  return tasks[idx];
}
export function updateTaskStatus(id: string, status: TaskStatus, userId: string): Task | null {
  const task = getTask(id);
  if (!task) return null;
  const oldStatus = task.status;
  const updated = updateTask(id, { status });
  if (updated && oldStatus !== status) {
    addHistory(id, userId, 'status', oldStatus, status);
    if (updated.assigneeId && updated.assigneeId !== userId) {
      createNotification(updated.assigneeId, 'status_changed', `Статус задачи «${updated.title}» изменён`, id);
    }
  }
  return updated;
}

// Comments
export function getComments(): Comment[] { return load<Comment>(KEYS.comments); }
export function getCommentsByTask(taskId: string): Comment[] { return load<Comment>(KEYS.comments).filter(c => c.taskId === taskId); }
export function addComment(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Comment {
  const comments = load<Comment>(KEYS.comments);
  const comment: Comment = { ...data, id: uid(), createdAt: new Date().toISOString(), updatedAt: null };
  comments.push(comment);
  save(KEYS.comments, comments);
  const task = getTask(data.taskId);
  if (task && task.assigneeId && task.assigneeId !== data.authorId) {
    createNotification(task.assigneeId, 'new_comment', `Новый комментарий к задаче «${task.title}»`, data.taskId);
  }
  return comment;
}
export function updateComment(id: string, text: string): Comment | null {
  const comments = load<Comment>(KEYS.comments);
  const idx = comments.findIndex(c => c.id === id);
  if (idx === -1) return null;
  comments[idx] = { ...comments[idx], text, updatedAt: new Date().toISOString() };
  save(KEYS.comments, comments);
  return comments[idx];
}
export function deleteComment(id: string) {
  save(KEYS.comments, load<Comment>(KEYS.comments).filter(c => c.id !== id));
}

// Notifications
export function getNotifications(): Notification[] { return load<Notification>(KEYS.notifications); }
export function getNotificationsByUser(userId: string): Notification[] { return load<Notification>(KEYS.notifications).filter(n => n.userId === userId); }
export function createNotification(userId: string, type: Notification['type'], message: string, taskId: string | null = null): Notification {
  const notifications = load<Notification>(KEYS.notifications);
  const n: Notification = { id: uid(), userId, type, message, taskId, read: false, createdAt: new Date().toISOString() };
  notifications.push(n);
  save(KEYS.notifications, notifications);
  return n;
}
export function markNotificationRead(id: string) {
  const notifications = load<Notification>(KEYS.notifications);
  const idx = notifications.findIndex(n => n.id === id);
  if (idx >= 0) { notifications[idx].read = true; save(KEYS.notifications, notifications); }
}
export function markAllNotificationsRead(userId: string) {
  const notifications = load<Notification>(KEYS.notifications).map(n => n.userId === userId ? { ...n, read: true } : n);
  save(KEYS.notifications, notifications);
}

// History
export function getHistory(): TaskHistory[] { return load<TaskHistory>(KEYS.history); }
export function deleteTask(id: string) {
  save(KEYS.tasks, load<Task>(KEYS.tasks).filter(t => t.id !== id));
  save(KEYS.comments, load<Comment>(KEYS.comments).filter(c => c.taskId !== id));
  save(KEYS.history, load<TaskHistory>(KEYS.history).filter(h => h.taskId !== id));
}
export function deleteProject(id: string) {
  save(KEYS.projects, load<Project>(KEYS.projects).filter(p => p.id !== id));
  const tasks = load<Task>(KEYS.tasks).filter(t => t.projectId !== id);
  save(KEYS.tasks, tasks);
}
export function getHistoryByTask(taskId: string): TaskHistory[] { return load<TaskHistory>(KEYS.history).filter(h => h.taskId === taskId); }
export function addHistory(taskId: string, userId: string, field: string, oldValue: string | null, newValue: string | null) {
  const history = load<TaskHistory>(KEYS.history);
  history.push({ id: uid(), taskId, userId, field, oldValue, newValue, createdAt: new Date().toISOString() });
  save(KEYS.history, history);
}

// Search
export function search(query: string, userId: string, role: string) {
  const q = query.toLowerCase();
  const tasks = getTasks().filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  const projects = getProjects().filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  const users = getUsers().filter(u => (u.firstName + ' ' + u.lastName).toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  return { tasks, projects, users };
}
