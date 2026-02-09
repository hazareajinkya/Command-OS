"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

const statusOptions = [
  "inbox",
  "assigned",
  "in_progress",
  "review",
  "done",
  "blocked",
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

export default function TaskDetail({
  taskId,
  onClose,
}: {
  taskId: Id<"tasks">;
  onClose: () => void;
}) {
  const task = useQuery(api.tasks.get, { id: taskId });
  const messages = useQuery(api.messages.listByTask, { taskId });
  const agents = useQuery(api.agents.list);
  const documents = useQuery(api.documents.listByTask, { taskId });
  const updateStatus = useMutation(api.tasks.updateStatus);
  const postMessage = useMutation(api.messages.create);

  const [newComment, setNewComment] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Id<"agents"> | "">("");
  const [showContent, setShowContent] = useState(false);

  if (!task || !agents) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-card-bg border border-card-border rounded-2xl w-full max-w-2xl p-6 animate-pulse h-96" />
      </div>
    );
  }

  const getAgent = (id: Id<"agents">) => agents.find((a) => a._id === id);

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedAgent) return;
    await postMessage({
      taskId,
      fromAgentId: selectedAgent as Id<"agents">,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  const handleArchive = async () => {
    await updateStatus({ id: taskId, status: "done" });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[10px] text-muted font-mono tracking-wider">
                TASK DETAIL
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground text-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            {task.title}
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-3 border-b border-card-border space-y-3">
          {/* Status, Priority, Assignees */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted font-mono uppercase">
                Status:
              </span>
              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus({
                    id: taskId,
                    status: e.target.value as (typeof statusOptions)[number],
                  })
                }
                className="text-xs bg-surface border border-card-border rounded px-2 py-1 text-foreground"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {task.priority && (
              <span className="text-[10px] text-muted font-mono uppercase">
                Priority:{" "}
                <span
                  className={`text-foreground ${
                    task.priority === "urgent"
                      ? "text-danger"
                      : task.priority === "high"
                        ? "text-warning"
                        : ""
                  }`}
                >
                  {task.priority}
                </span>
              </span>
            )}

            {task.assigneeIds.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted font-mono uppercase">
                  Assigned:
                </span>
                {task.assigneeIds.map((id) => {
                  const agent = getAgent(id);
                  return (
                    <span
                      key={id}
                      className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <span className="w-3 h-3 rounded-full bg-surface flex items-center justify-center text-[8px]">
                        {agent?.avatar}
                      </span>
                      {agent?.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted font-mono uppercase">
                Tags:
              </span>
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-muted bg-surface px-2 py-0.5 rounded border border-card-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowContent(!showContent)}
              className="text-[11px] text-info hover:text-info/80 transition-colors"
            >
              {showContent ? "▼" : "▶"} View content
            </button>
            <button
              onClick={handleArchive}
              className="text-[11px] text-success hover:text-success/80 transition-colors ml-4"
            >
              ✅ Archive Task
            </button>
          </div>

          {/* Expandable Content / Docs */}
          {showContent && documents && documents.length > 0 && (
            <div className="bg-surface/50 rounded-lg p-3 border border-card-border max-h-40 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc._id} className="mb-2">
                  <p className="text-[10px] text-accent font-semibold">
                    📄 {doc.title}
                  </p>
                  <p className="text-[10px] text-foreground/70 whitespace-pre-wrap line-clamp-4">
                    {doc.content}
                  </p>
                </div>
              ))}
            </div>
          )}
          {showContent && (!documents || documents.length === 0) && (
            <p className="text-[10px] text-muted italic">
              No documents attached to this task yet.
            </p>
          )}
        </div>

        {/* Comments Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-[10px] text-muted font-mono uppercase mb-3">
            Comments ({messages?.length ?? 0})
          </p>
          {!messages || messages.length === 0 ? (
            <p className="text-center text-muted text-xs py-6">
              No comments yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-sm flex-shrink-0 border border-card-border">
                    {msg.agentAvatar ?? "🤖"}
                  </div>
                  <div className="flex-1 min-w-0 bg-surface/30 rounded-lg p-3 border border-card-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-accent">
                        {msg.agentName}
                      </span>
                      <span className="text-[10px] text-muted font-mono">
                        {timeAgo(msg._creationTime)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="px-6 py-4 border-t border-card-border">
          <div className="flex gap-2 mb-2">
            <select
              value={selectedAgent}
              onChange={(e) =>
                setSelectedAgent(e.target.value as Id<"agents"> | "")
              }
              className="text-xs bg-surface border border-card-border rounded px-2 py-1.5 text-foreground"
            >
              <option value="">Post as...</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.avatar} {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
              placeholder="Add a comment... (use @AgentName to mention)"
              className="flex-1 text-xs bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
            />
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim() || !selectedAgent}
              className="text-xs bg-accent text-black font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
