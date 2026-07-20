import type { User, Project, Task, Comment, Notification, TaskHistory } from './types';

let taskCounter = 0;
function nextTaskNumber(): number { return ++taskCounter; }

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString();
}

export const seedUsers: User[] = [
  { id: 'u1', email: 'volkova@nordflow.ru', password: '123456', firstName: 'Анна', lastName: 'Волкова', role: 'admin', position: 'Операционный директор', avatar: null, theme: 'light' },
  { id: 'u2', email: 'orlov@nordflow.ru', password: '123456', firstName: 'Максим', lastName: 'Орлов', role: 'project_lead', position: 'Руководитель проекта', avatar: null, theme: 'light' },
  { id: 'u3', email: 'sokolova@nordflow.ru', password: '123456', firstName: 'Елена', lastName: 'Соколова', role: 'employee', position: 'Дизайнер', avatar: null, theme: 'light' },
  { id: 'u4', email: 'morozov@nordflow.ru', password: '123456', firstName: 'Илья', lastName: 'Морозов', role: 'employee', position: 'Frontend-разработчик', avatar: null, theme: 'dark' },
  { id: 'u5', email: 'lebedev@nordflow.ru', password: '123456', firstName: 'Виктор', lastName: 'Лебедев', role: 'employee', position: 'Backend-разработчик', avatar: null, theme: 'light' },
  { id: 'u6', email: 'krylova@nordflow.ru', password: '123456', firstName: 'Ольга', lastName: 'Крылова', role: 'project_lead', position: 'Маркетолог', avatar: null, theme: 'light' },
  { id: 'u7', email: 'frolov@nordflow.ru', password: '123456', firstName: 'Дмитрий', lastName: 'Фролов', role: 'employee', position: 'Тестировщик', avatar: null, theme: 'light' },
  { id: 'u8', email: 'belova@nordflow.ru', password: '123456', firstName: 'Мария', lastName: 'Белова', role: 'employee', position: 'Аналитик', avatar: null, theme: 'light' },
];

export const seedProjects: Project[] = [
  { id: 'p1', name: 'GreenStone — Сайт', description: 'Разработка сайта для клиента GreenStone. Полный цикл: дизайн, верстка, CMS, тестирование.', status: 'active', startDate: daysAgo(30), endDate: daysFromNow(45), leadId: 'u2', memberIds: ['u2','u3','u4','u5','u7'], createdAt: daysAgo(30) },
  { id: 'p2', name: 'Рекламная кампания NordFlow', description: 'Запуск рекламной кампании: аналитика, креативы, таргетинг, мониторинг результатов.', status: 'planning', startDate: daysAgo(10), endDate: daysFromNow(60), leadId: 'u6', memberIds: ['u6','u3','u8'], createdAt: daysAgo(10) },
  { id: 'p3', name: 'Автоматизация отдела продаж', description: 'Внутренняя автоматизация: парсинг заявок, интеграция CRM, дашборд для руководителя.', status: 'active', startDate: daysAgo(20), endDate: daysFromNow(30), leadId: 'u1', memberIds: ['u1','u4','u5','u8'], createdAt: daysAgo(20) },
];

export function generateSeedTasks(): Task[] {
  taskCounter = 0;
  const tasks: Task[] = [
    { id: uid(), number: nextTaskNumber(), title: 'Дизайн главной страницы', description: 'Разработать макет главной страницы в Figma. Учесть все секции из ТЗ клиента.', status: 'in_progress', priority: 'high', projectId: 'p1', assigneeId: 'u3', authorId: 'u2', deadline: daysFromNow(5), tags: ['дизайн', 'UI'], attachments: [], createdAt: daysAgo(25), updatedAt: daysAgo(2) },
    { id: uid(), number: nextTaskNumber(), title: 'Верстка главной страницы', description: 'Сверстать главную по макету. Адаптивная верстка, кроссбраузерность.', status: 'planned', priority: 'medium', projectId: 'p1', assigneeId: 'u4', authorId: 'u2', deadline: daysFromNow(12), tags: ['frontend', 'верстка'], attachments: [], createdAt: daysAgo(20), updatedAt: daysAgo(20) },
    { id: uid(), number: nextTaskNumber(), title: 'Интеграция CMS', description: 'Подключить CMS к сайту. Настройка редактирования контента.', status: 'planned', priority: 'high', projectId: 'p1', assigneeId: 'u5', authorId: 'u2', deadline: daysFromNow(25), tags: ['backend', 'CMS'], attachments: [], createdAt: daysAgo(18), updatedAt: daysAgo(18) },
    { id: uid(), number: nextTaskNumber(), title: 'Тестирование формы заявки', description: 'Проверить форму обратной связи на всех устройствах и браузерах.', status: 'backlog', priority: 'low', projectId: 'p1', assigneeId: 'u7', authorId: 'u2', deadline: daysFromNow(30), tags: ['тестирование'], attachments: [], createdAt: daysAgo(15), updatedAt: daysAgo(15) },
    { id: uid(), number: nextTaskNumber(), title: 'Дизайн внутренних страниц', description: 'Разработать макеты страниц «О компании», «Услуги», «Контакты».', status: 'in_progress', priority: 'medium', projectId: 'p1', assigneeId: 'u3', authorId: 'u2', deadline: daysFromNow(10), tags: ['дизайн'], attachments: [], createdAt: daysAgo(22), updatedAt: daysAgo(5) },
    { id: uid(), number: nextTaskNumber(), title: 'Настройка деплоя', description: 'Настроить CI/CD и развернуть сайт на сервере клиента.', status: 'backlog', priority: 'medium', projectId: 'p1', assigneeId: 'u5', authorId: 'u2', deadline: null, tags: ['DevOps'], attachments: [], createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    { id: uid(), number: nextTaskNumber(), title: 'SEO-оптимизация', description: 'Внедрить мета-теги, structured data, оптимизировать скорость загрузки.', status: 'backlog', priority: 'low', projectId: 'p1', assigneeId: null, authorId: 'u2', deadline: null, tags: ['SEO'], attachments: [], createdAt: daysAgo(8), updatedAt: daysAgo(8) },
    { id: uid(), number: nextTaskNumber(), title: 'Ревью кода главной', description: 'Провести code review верстки главной страницы.', status: 'in_review', priority: 'medium', projectId: 'p1', assigneeId: 'u2', authorId: 'u4', deadline: daysFromNow(1), tags: ['review'], attachments: [], createdAt: daysAgo(7), updatedAt: daysAgo(1) },
    { id: uid(), number: nextTaskNumber(), title: 'Мобильная адаптация', description: 'Доработать мобильную версию всех страниц для экранов < 768px.', status: 'backlog', priority: 'high', projectId: 'p1', assigneeId: 'u4', authorId: 'u2', deadline: daysFromNow(20), tags: ['frontend', 'мобильная версия'], attachments: [], createdAt: daysAgo(5), updatedAt: daysAgo(5) },

    { id: uid(), number: nextTaskNumber(), title: 'Анализ целевой аудитории', description: 'Собрать данные по ЦА: демография, интересы, платформы.', status: 'in_progress', priority: 'medium', projectId: 'p2', assigneeId: 'u8', authorId: 'u6', deadline: daysFromNow(7), tags: ['аналитика'], attachments: [], createdAt: daysAgo(8), updatedAt: daysAgo(3) },
    { id: uid(), number: nextTaskNumber(), title: 'Креативы для VK', description: 'Разработать 5 вариантов рекламных креативов для ВКонтакте.', status: 'planned', priority: 'high', projectId: 'p2', assigneeId: 'u3', authorId: 'u6', deadline: daysFromNow(14), tags: ['дизайн', 'реклама'], attachments: [], createdAt: daysAgo(7), updatedAt: daysAgo(7) },
    { id: uid(), number: nextTaskNumber(), title: 'Настройка таргетинга', description: 'Настроить таргетинг рекламных кампаний в VK и Яндекс.Директ.', status: 'backlog', priority: 'medium', projectId: 'p2', assigneeId: 'u6', authorId: 'u6', deadline: daysFromNow(20), tags: ['реклама', 'таргетинг'], attachments: [], createdAt: daysAgo(5), updatedAt: daysAgo(5) },
    { id: uid(), number: nextTaskNumber(), title: 'Бюджет кампании', description: 'Рассчитать и согласовать бюджет рекламной кампании.', status: 'done', priority: 'high', projectId: 'p2', assigneeId: 'u6', authorId: 'u1', deadline: daysAgo(5), tags: ['финансы'], attachments: [], createdAt: daysAgo(9), updatedAt: daysAgo(4) },
    { id: uid(), number: nextTaskNumber(), title: 'Тексты для рекламы', description: 'Написать рекламные тексты для всех площадок.', status: 'planned', priority: 'medium', projectId: 'p2', assigneeId: 'u6', authorId: 'u6', deadline: daysFromNow(10), tags: ['копирайтинг'], attachments: [], createdAt: daysAgo(4), updatedAt: daysAgo(4) },
    { id: uid(), number: nextTaskNumber(), title: 'A/B тестирование', description: 'Подготовить и провести A/B тесты рекламных креативов.', status: 'backlog', priority: 'low', projectId: 'p2', assigneeId: null, authorId: 'u6', deadline: null, tags: ['тестирование'], attachments: [], createdAt: daysAgo(3), updatedAt: daysAgo(3) },

    { id: uid(), number: nextTaskNumber(), title: 'API для интеграции CRM', description: 'Разработать REST API для синхронизации данных с CRM-системой.', status: 'in_progress', priority: 'critical', projectId: 'p3', assigneeId: 'u5', authorId: 'u1', deadline: daysFromNow(3), tags: ['backend', 'API', 'CRM'], attachments: [], createdAt: daysAgo(18), updatedAt: daysAgo(1) },
    { id: uid(), number: nextTaskNumber(), title: 'Парсинг заявок', description: 'Разработать модуль автоматического парсинга заявок с сайта.', status: 'planned', priority: 'high', projectId: 'p3', assigneeId: 'u4', authorId: 'u1', deadline: daysFromNow(15), tags: ['backend', 'парсинг'], attachments: [], createdAt: daysAgo(15), updatedAt: daysAgo(15) },
    { id: uid(), number: nextTaskNumber(), title: 'Дашборд для руководителя', description: 'Создать интерактивный дашборд с KPI отдела продаж.', status: 'backlog', priority: 'medium', projectId: 'p3', assigneeId: 'u3', authorId: 'u1', deadline: daysFromNow(25), tags: ['frontend', 'дашборд'], attachments: [], createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    { id: uid(), number: nextTaskNumber(), title: 'Автоматизация отчётов', description: 'Настроить автоматическую генерацию еженедельных отчётов.', status: 'backlog', priority: 'low', projectId: 'p3', assigneeId: 'u8', authorId: 'u1', deadline: null, tags: ['автоматизация'], attachments: [], createdAt: daysAgo(8), updatedAt: daysAgo(8) },
    { id: uid(), number: nextTaskNumber(), title: 'Тестирование API', description: 'Написать и провести unit/integration тесты для CRM API.', status: 'planned', priority: 'high', projectId: 'p3', assigneeId: 'u7', authorId: 'u1', deadline: daysFromNow(10), tags: ['тестирование', 'API'], attachments: [], createdAt: daysAgo(12), updatedAt: daysAgo(12) },
    { id: uid(), number: nextTaskNumber(), title: 'Документация API', description: 'Составить Swagger-документацию для всех эндпоинтов.', status: 'backlog', priority: 'low', projectId: 'p3', assigneeId: 'u5', authorId: 'u1', deadline: null, tags: ['документация'], attachments: [], createdAt: daysAgo(7), updatedAt: daysAgo(7) },

    { id: uid(), number: nextTaskNumber(), title: 'Рефакторинг авторизации', description: 'Переработать модуль авторизации: добавить refresh-токены.', status: 'done', priority: 'medium', projectId: 'p3', assigneeId: 'u5', authorId: 'u1', deadline: daysAgo(7), tags: ['backend', 'безопасность'], attachments: [], createdAt: daysAgo(14), updatedAt: daysAgo(7) },
    { id: uid(), number: nextTaskNumber(), title: 'Кроссбраузерное тестирование', description: 'Проверить работу приложения в Chrome, Firefox, Safari, Edge.', status: 'done', priority: 'low', projectId: 'p1', assigneeId: 'u7', authorId: 'u2', deadline: daysAgo(3), tags: ['тестирование'], attachments: [], createdAt: daysAgo(12), updatedAt: daysAgo(3) },
    { id: uid(), number: nextTaskNumber(), title: 'Презитация клиенту', description: 'Подготовить презентацию промежуточных результатов для GreenStone.', status: 'done', priority: 'high', projectId: 'p1', assigneeId: 'u2', authorId: 'u1', deadline: daysAgo(2), tags: ['презентация'], attachments: [], createdAt: daysAgo(7), updatedAt: daysAgo(2) },

    { id: uid(), number: nextTaskNumber(), title: 'Интеграция с Яндекс.Метрикой', description: 'Подключить Яндекс.Метрику и настроить цели.', status: 'backlog', priority: 'low', projectId: 'p2', assigneeId: null, authorId: 'u6', deadline: daysFromNow(40), tags: ['аналитика'], attachments: [], createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    { id: uid(), number: nextTaskNumber(), title: 'Лендинг для акции', description: 'Создать лендинг для промо-акции кампании.', status: 'planned', priority: 'high', projectId: 'p2', assigneeId: 'u4', authorId: 'u6', deadline: daysFromNow(18), tags: ['frontend', 'лендинг'], attachments: [], createdAt: daysAgo(3), updatedAt: daysAgo(3) },

    { id: uid(), number: nextTaskNumber(), title: 'Оптимизация производительности', description: 'Оптимизировать загрузку страниц, сжатие изображений, кеширование.', status: 'in_progress', priority: 'high', projectId: 'p1', assigneeId: 'u4', authorId: 'u2', deadline: daysFromNow(8), tags: ['frontend', 'performance'], attachments: [], createdAt: daysAgo(4), updatedAt: daysAgo(2) },
    { id: uid(), number: nextTaskNumber(), title: 'Настройка мониторинга', description: 'Внедрить мониторинг ошибок (Sentry или аналог).', status: 'backlog', priority: 'medium', projectId: 'p3', assigneeId: null, authorId: 'u1', deadline: daysFromNow(28), tags: ['DevOps'], attachments: [], createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  ];
  return tasks;
}

export function generateSeedComments(tasks: Task[]): Comment[] {
  const comments: Comment[] = [];
  const sampleTexts = [
    'Готово, можно переходить к следующему этапу.',
    'Есть замечания по стилям, нужно доработать.',
    'Отлично, клиент доволен промежуточным результатом.',
    'Нужно исправить баг с адаптивностью на iPhone.',
    'Добавил описание в документацию.',
    'Проверил — всё работает корректно.',
    'Согласовано с руководством, можно приступать.',
    'Необходимо ускорить загрузку, сейчас > 3s.',
    'Креативы отправлены на согласование.',
    'API протестирован, все эндпоинты отвечают.',
  ];
  const relevantTasks = tasks.filter(t => ['in_progress', 'in_review', 'done'].includes(t.status));
  relevantTasks.forEach(task => {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      comments.push({
        id: uid(),
        taskId: task.id,
        authorId: task.assigneeId || task.authorId,
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
        createdAt: daysAgo(Math.floor(Math.random() * 10) + 1),
        updatedAt: null,
      });
    }
  });
  return comments;
}

export function generateSeedHistory(tasks: Task[]): TaskHistory[] {
  const history: TaskHistory[] = [];
  tasks.forEach(task => {
    history.push({
      id: uid(), taskId: task.id, userId: task.authorId,
      field: 'status', oldValue: null, newValue: task.status,
      createdAt: task.createdAt,
    });
    if (task.assigneeId && task.assigneeId !== task.authorId) {
      history.push({
        id: uid(), taskId: task.id, userId: task.authorId,
        field: 'assignee', oldValue: null, newValue: task.assigneeId,
        createdAt: task.createdAt,
      });
    }
  });
  return history;
}

export function generateSeedNotifications(): Notification[] {
  return [
    { id: uid(), userId: 'u3', type: 'task_assigned', message: 'Вам назначена задача «Дизайн главной страницы»', taskId: null, read: false, createdAt: daysAgo(2) },
    { id: uid(), userId: 'u4', type: 'deadline_approaching', message: 'Дедлайн задачи «Верстка главной страницы» через 5 дней', taskId: null, read: false, createdAt: daysAgo(1) },
    { id: uid(), userId: 'u5', type: 'new_comment', message: 'Новый комментарий к задаче «API для интеграции CRM»', taskId: null, read: true, createdAt: daysAgo(1) },
    { id: uid(), userId: 'u2', type: 'status_changed', message: 'Задача «Ревью кода главной» переведена в «На проверке»', taskId: null, read: false, createdAt: daysAgo(1) },
    { id: uid(), userId: 'u7', type: 'task_assigned', message: 'Вам назначена задача «Тестирование формы заявки»', taskId: null, read: true, createdAt: daysAgo(5) },
  ];
}
