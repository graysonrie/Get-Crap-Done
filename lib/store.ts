import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

export interface Task {
  id: string;
  name: string;
  hours: number;
  minutes: number;
  createdAt: number; // timestamp
  startTime: number; // timestamp when this task should start (after previous tasks)
  completionTime: number; // timestamp when this task should complete
}

interface TaskStore {
  tasks: Task[];
  store: Store | null;
  initializeStore: () => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "startTime" | "completionTime">
  ) => void;
  updateTask: (
    id: string,
    task: Partial<
      Omit<Task, "id" | "createdAt" | "startTime" | "completionTime">
    >
  ) => void;
  removeTask: (id: string) => void;
  removeCompletedTasks: () => void;
  calculateTaskTimes: () => void;
}

const calculateTaskTimes = (tasks: Task[]): Task[] => {
  if (tasks.length === 0) return [];

  const now = Date.now();
  let currentTime = now;

  return tasks.map((task) => {
    const durationMs = (task.hours * 60 + task.minutes) * 60 * 1000;
    const startTime = currentTime;
    const completionTime = currentTime + durationMs;

    currentTime = completionTime; // Next task starts when this one completes

    return {
      ...task,
      startTime,
      completionTime,
    };
  });
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  store: null,

  initializeStore: async () => {
    try {
      const store = await Store.load(".tasks.dat");
      const saved = await store.get<Task[]>("tasks");

      if (saved) {
        // Recalculate times for saved tasks
        const tasksWithTimes = calculateTaskTimes(saved);
        set({ tasks: tasksWithTimes, store });
      } else {
        set({ store });
      }
    } catch (error) {
      console.error("Failed to initialize store:", error);
      set({ store: null });
    }
  },

  addTask: (taskData) => {
    const { tasks, store } = get();
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      startTime: 0,
      completionTime: 0,
    };

    const updatedTasks = [...tasks, newTask];
    const tasksWithTimes = calculateTaskTimes(updatedTasks);

    set({ tasks: tasksWithTimes });

    if (store) {
      // Save without calculated times (they'll be recalculated on load)
      const tasksToSave = tasksWithTimes.map(
        ({ id, name, hours, minutes, createdAt }) => ({
          id,
          name,
          hours,
          minutes,
          createdAt,
          startTime: 0,
          completionTime: 0,
        })
      );
      store.set("tasks", tasksToSave);
      store.save();
    }
  },

  updateTask: (id, taskData) => {
    const { tasks, store } = get();
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...taskData } : task
    );
    const tasksWithTimes = calculateTaskTimes(updatedTasks);

    set({ tasks: tasksWithTimes });

    if (store) {
      const tasksToSave = tasksWithTimes.map(
        ({ id, name, hours, minutes, createdAt }) => ({
          id,
          name,
          hours,
          minutes,
          createdAt,
          startTime: 0,
          completionTime: 0,
        })
      );
      store.set("tasks", tasksToSave);
      store.save();
    }
  },

  removeTask: (id) => {
    const { tasks, store } = get();
    const updatedTasks = tasks.filter((task) => task.id !== id);
    const tasksWithTimes = calculateTaskTimes(updatedTasks);

    set({ tasks: tasksWithTimes });

    if (store) {
      const tasksToSave = tasksWithTimes.map(
        ({ id, name, hours, minutes, createdAt }) => ({
          id,
          name,
          hours,
          minutes,
          createdAt,
          startTime: 0,
          completionTime: 0,
        })
      );
      store.set("tasks", tasksToSave);
      store.save();
    }
  },

  removeCompletedTasks: () => {
    const { tasks } = get();
    const now = Date.now();
    const activeTasks = tasks.filter((task) => task.completionTime > now);

    if (activeTasks.length !== tasks.length) {
      const { store } = get();
      const tasksWithTimes = calculateTaskTimes(activeTasks);
      set({ tasks: tasksWithTimes });

      if (store) {
        const tasksToSave = tasksWithTimes.map(
          ({ id, name, hours, minutes, createdAt }) => ({
            id,
            name,
            hours,
            minutes,
            createdAt,
            startTime: 0,
            completionTime: 0,
          })
        );
        store.set("tasks", tasksToSave);
        store.save();
      }
    }
  },

  calculateTaskTimes: () => {
    const { tasks } = get();
    const tasksWithTimes = calculateTaskTimes(tasks);
    set({ tasks: tasksWithTimes });
  },
}));
