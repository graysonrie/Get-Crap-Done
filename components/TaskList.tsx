"use client";

import { useTaskStore } from "@/lib/store";
import { TaskItem } from "@/components/TaskItem";

interface TaskListProps {
  onTaskClick: (taskId: string) => void;
}

export function TaskList({ onTaskClick }: TaskListProps) {
  const tasks = useTaskStore((state) => state.tasks);
  const removeTask = useTaskStore((state) => state.removeTask);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No tasks yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click "Add Task" to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task.id)}
          onRemove={() => removeTask(task.id)}
        />
      ))}
    </div>
  );
}
