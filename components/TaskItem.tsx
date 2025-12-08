"use client";

import { Check } from "lucide-react";
import { type Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface TaskItemProps {
  task: Task;
  onClick: () => void;
  onRemove: () => void;
}

export function TaskItem({ task, onClick, onRemove }: TaskItemProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = () => {
    const parts: string[] = [];
    if (task.hours > 0) {
      parts.push(`${task.hours} ${task.hours === 1 ? "hour" : "hours"}`);
    }
    if (task.minutes > 0) {
      parts.push(`${task.minutes} ${task.minutes === 1 ? "minute" : "minutes"}`);
    }
    return parts.join(" ") || "0 minutes";
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full rounded-lg border bg-card p-4 transition-colors",
        "hover:bg-accent hover:border-accent-foreground/20"
      )}
    >
      <button
        onClick={onClick}
        className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
      >
        <div className="space-y-2">
          <h3 className="font-medium text-foreground break-words">
            {task.name}
          </h3>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>Duration: {formatDuration()}</span>
            <span>Completes at: {formatTime(task.completionTime)}</span>
          </div>
        </div>
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCheckClick}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 dark:text-green-500 dark:hover:text-green-400 shrink-0"
            aria-label="Mark as done"
          >
            <Check className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mark as done</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
