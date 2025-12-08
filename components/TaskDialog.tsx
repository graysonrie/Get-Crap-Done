"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTaskStore, type Task } from "@/lib/store";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const [name, setName] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setHours(task.hours);
      setMinutes(task.minutes);
    } else {
      setName("");
      setHours(0);
      setMinutes(30);
    }
  }, [task, open]);

  const calculateCompletionTime = () => {
    if (!name.trim() || (hours === 0 && minutes === 0)) return null;

    const now = Date.now();
    const durationMs = (hours * 60 + minutes) * 60 * 1000;

    if (task) {
      // For editing, recalculate all tasks to get accurate time
      // This is a simplified preview - actual time will be recalculated on save
      const taskIndex = tasks.findIndex((t) => t.id === task.id);
      if (taskIndex === -1) return null;

      // Calculate from the previous task's completion, or now if first task
      let currentTime = now;
      for (let i = 0; i < taskIndex; i++) {
        const prevTask = tasks[i];
        const prevDurationMs = (prevTask.hours * 60 + prevTask.minutes) * 60 * 1000;
        currentTime += prevDurationMs;
      }

      const newDurationMs = (hours * 60 + minutes) * 60 * 1000;
      return new Date(currentTime + newDurationMs);
    } else {
      // For new task, calculate from end of all tasks
      let currentTime = now;
      tasks.forEach((t) => {
        const durationMs = (t.hours * 60 + t.minutes) * 60 * 1000;
        currentTime += durationMs;
      });
      return new Date(currentTime + durationMs);
    }
  };

  const completionTime = calculateCompletionTime();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (task) {
      updateTask(task.id, { name: name.trim(), hours, minutes });
    } else {
      addTask({ name: name.trim(), hours, minutes });
    }
    onOpenChange(false);
  };

  const handleHoursChange = (value: string) => {
    const num = parseInt(value, 10) || 0;
    setHours(Math.max(0, Math.min(23, num)));
  };

  const handleMinutesChange = (value: string) => {
    const num = parseInt(value, 10) || 0;
    setMinutes(Math.max(0, Math.min(59, num)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update the task details below."
              : "Create a new task with a name and duration."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => handleHoursChange(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
              />
            </div>
          </div>
          {completionTime && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">Expected Completion</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(completionTime)}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {task ? "Save" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
