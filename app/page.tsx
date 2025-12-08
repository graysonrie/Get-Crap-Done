"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTaskStore, type Task } from "@/lib/store";
import { TaskList } from "@/components/TaskList";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
// when using `"withGlobalTauri": true`, you may use
// const { enable, isEnabled, disable } = window.__TAURI__.autostart;

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const initializeStore = useTaskStore((state) => state.initializeStore);
  const removeCompletedTasks = useTaskStore(
    (state) => state.removeCompletedTasks
  );
  const calculateTaskTimes = useTaskStore((state) => state.calculateTaskTimes);
  // Enable autostart
  useEffect(() => {
    const enableAutostart = async () => {
      await enable();
      // Check enable state
      console.log(`registered for autostart? ${await isEnabled()}`);
    };
    enableAutostart();
  }, []);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    // Recalculate task times periodically to account for time passing
    const interval = setInterval(() => {
      calculateTaskTimes();
      removeCompletedTasks();
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [calculateTaskTimes, removeCompletedTasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleTaskClick = (taskId: string) => {
    const tasks = useTaskStore.getState().tasks;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex h-[calc(100vh-2.5rem)] flex-col bg-background overflow-hidden font-sans">
      {/* Main content area with scrolling */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <TaskList onTaskClick={handleTaskClick} />
      </div>

      {/* Sticky Add Task button at bottom */}
      <div className="sticky bottom-0 border-t bg-background px-4 py-3">
        <Button onClick={handleAddTask} className="w-full" size="lg">
          <Plus className="h-5 w-5" />
          Add Task
        </Button>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
      />
    </div>
  );
}
