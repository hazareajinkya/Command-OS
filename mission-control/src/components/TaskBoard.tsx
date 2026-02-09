"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

const columns = [
  { key: "inbox", label: "INBOX", color: "border-muted/40", dot: "bg-muted" },
  { key: "assigned", label: "ASSIGNED", color: "border-info/40", dot: "bg-info" },
  {
    key: "in_progress",
    label: "IN PROGRESS",
    color: "border-accent/40",
    dot: "bg-accent",
  },
  { key: "review", label: "REVIEW", color: "border-warning/40", dot: "bg-warning" },
  { key: "done", label: "DONE", color: "border-success/40", dot: "bg-success" },
] as const;

type TaskStatus = (typeof columns)[number]["key"] | "blocked";

const statusFilters = [
  { key: "all", label: "All" },
  { key: "inbox", label: "Inbox" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "Active" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
  { key: "blocked", label: "Waiting" },
] as const;

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `about ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `about ${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function TaskBoard({
  onSelectTask,
}: {
  onSelectTask: (taskId: Id<"tasks">) => void;
}) {
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [dragging, setDragging] = useState<Id<"tasks"> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!tasks || !agents) {
    return (
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-5 gap-3">
          {columns.map((col) => (
            <div
              key={col.key}
              className="bg-surface/30 rounded-xl p-3 min-h-[400px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const getAgentInfo = (id: Id<"agents">) => {
    return agents.find((a) => a._id === id);
  };

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  const handleDrop = async (taskId: Id<"tasks">, newStatus: TaskStatus) => {
    await updateStatus({ id: taskId, status: newStatus });
    setDragging(null);
  };

  // Count by status
  const statusCounts: Record<string, number> = { all: tasks.length };
  for (const t of tasks) {
    statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <h2 className="text-xs font-semibold text-foreground tracking-tight">
            MISSION QUEUE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted font-mono bg-surface px-1.5 py-0.5 rounded">
            🎯 {statusCounts.in_progress ?? 0}
          </span>
          <span className="text-[10px] text-muted font-mono bg-surface px-1.5 py-0.5 rounded">
            {tasks.length} active
          </span>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-1 mb-4">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
              statusFilter === f.key
                ? "border-accent bg-accent/10 text-accent font-semibold"
                : "border-card-border text-muted hover:border-muted"
            }`}
          >
            {f.label}{" "}
            <span className="opacity-60">{statusCounts[f.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-5 gap-3">
        {columns
          .filter(
            (col) =>
              statusFilter === "all" || statusFilter === col.key
          )
          .map((col) => (
            <div
              key={col.key}
              className={`bg-surface/30 border-t-2 ${col.color} rounded-xl p-3 min-h-[400px]`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragging && handleDrop(dragging, col.key)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3 className="text-[10px] font-bold text-foreground/70 tracking-wider">
                    {col.label}
                  </h3>
                </div>
                <span className="text-[10px] text-muted font-mono bg-card-bg px-1.5 py-0.5 rounded">
                  {tasksByStatus(col.key).length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-2">
                {tasksByStatus(col.key).map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={() => setDragging(task._id)}
                    onClick={() => onSelectTask(task._id)}
                    className="bg-card-bg border border-card-border rounded-lg p-3 cursor-pointer hover:border-accent/30 transition-all group"
                  >
                    {/* Priority indicator */}
                    {task.priority === "urgent" && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-[9px] text-danger font-mono">
                          🚨
                        </span>
                      </div>
                    )}

                    <h4 className="text-xs font-medium text-foreground group-hover:text-accent transition-colors leading-tight mb-1.5">
                      {task.title}
                    </h4>

                    <p className="text-[10px] text-muted line-clamp-2 mb-2">
                      {task.description}
                    </p>

                    {/* Assignees */}
                    {task.assigneeIds.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        {task.assigneeIds.slice(0, 2).map((id) => {
                          const agent = getAgentInfo(id);
                          return (
                            <span
                              key={id}
                              className="text-[9px] text-muted flex items-center gap-0.5"
                            >
                              <span className="w-4 h-4 rounded-full bg-surface flex items-center justify-center text-[8px]">
                                {agent?.avatar ?? "🤖"}
                              </span>
                              {agent?.name}
                            </span>
                          );
                        })}
                        {task.assigneeIds.length > 2 && (
                          <span className="text-[9px] text-muted">
                            +{task.assigneeIds.length - 2}
                          </span>
                        )}
                        <span className="text-[9px] text-muted/50 ml-auto font-mono">
                          {timeAgo(task._creationTime)}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[8px] text-muted bg-surface px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-[8px] text-muted">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
