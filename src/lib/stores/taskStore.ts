import { create } from 'zustand';
import { Task, TaskStatus, TenantId, STORAGE_KEYS } from '@/lib/types';
import { generateId } from '@/lib/utils';

/**
 * Task Store
 * Manages Kanban board tasks with tenant isolation
 */
interface TaskState {
  tasks: Task[];
  isLoading: boolean;

  // Actions
  loadTasks: (tenantId: TenantId) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'tenantId'>, tenantId: TenantId) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, tenantId: TenantId) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, tenantId: TenantId) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  loadTasks: (tenantId: TenantId) => {
    if (typeof window === 'undefined') {
      set({ tasks: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const key = STORAGE_KEYS.getTenantTasks(tenantId);
      const tasksData = localStorage.getItem(key);
      
      if (tasksData) {
        const tasks = JSON.parse(tasksData) as Task[];
        set({ tasks, isLoading: false });
      } else {
        // Initialize with empty tasks for new tenant
        set({ tasks: [], isLoading: false });
        localStorage.setItem(key, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ tasks: [], isLoading: false });
    }
  },

  addTask: (taskData, tenantId) => {
    if (typeof window === 'undefined') return;

    // Sanitize inputs
    const sanitizedTitle = taskData.title.trim();
    const sanitizedDescription = taskData.description.trim();
    const sanitizedAssignee = taskData.assignee.trim();

    if (!sanitizedTitle || sanitizedTitle.length > 200) {
      console.error('Invalid task title');
      return;
    }

    const newTask: Task = {
      ...taskData,
      title: sanitizedTitle,
      description: sanitizedDescription,
      assignee: sanitizedAssignee,
      id: generateId(),
      createdAt: new Date().toISOString(),
      tenantId,
    };

    const updatedTasks = [...get().tasks, newTask];
    set({ tasks: updatedTasks });

    // Persist to localStorage
    try {
      const key = STORAGE_KEYS.getTenantTasks(tenantId);
      localStorage.setItem(key, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to save task:', error);
      // Revert on error
      set({ tasks: get().tasks.filter(t => t.id !== newTask.id) });
    }
  },

  updateTask: (taskId, updates) => {
    if (typeof window === 'undefined') return;

    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );

    set({ tasks: updatedTasks });

    // Persist to localStorage
    try {
      const key = STORAGE_KEYS.getTenantTasks(task.tenantId);
      localStorage.setItem(key, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert on error
      set({ tasks });
    }
  },

  deleteTask: (taskId, tenantId) => {
    if (typeof window === 'undefined') return;

    const tasks = get().tasks;
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    set({ tasks: updatedTasks });

    // Persist to localStorage
    try {
      const key = STORAGE_KEYS.getTenantTasks(tenantId);
      localStorage.setItem(key, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Revert on error
      set({ tasks });
    }
  },

  moveTask: (taskId, newStatus, tenantId) => {
    if (typeof window === 'undefined') return;

    const tasks = get().tasks;
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );

    set({ tasks: updatedTasks });

    // Persist to localStorage
    try {
      const key = STORAGE_KEYS.getTenantTasks(tenantId);
      localStorage.setItem(key, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to move task:', error);
      // Revert on error
      set({ tasks });
    }
  },

  getTasksByStatus: (status: TaskStatus) => {
    return get().tasks.filter(task => task.status === status);
  },
}));
