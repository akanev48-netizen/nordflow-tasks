export type Role = 'admin' | 'project_lead' | 'employee';

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';

export type TaskStatus = 'backlog' | 'planned' | 'in_progress' | 'in_review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  position: string;
  avatar: string | null;
  theme: 'light' | 'dark';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  leadId: string;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  number: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assigneeId: string | null;
  authorId: string;
  deadline: string | null;
  tags: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  addedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'deadline_changed' | 'status_changed' | 'new_comment' | 'deadline_approaching' | 'overdue';
  message: string;
  taskId: string | null;
  read: boolean;
  createdAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Бэклог',
  planned: 'Запланировано',
  in_progress: 'В работе',
  in_review: 'На проверке',
  done: 'Выполнено',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Планируется',
  active: 'Активный',
  paused: 'Приостановлен',
  completed: 'Завершён',
  archived: 'Архивный',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Администратор',
  project_lead: 'Руководитель проекта',
  employee: 'Сотрудник',
};

export const TASK_STATUSES: TaskStatus[] = ['backlog', 'planned', 'in_progress', 'in_review', 'done'];
