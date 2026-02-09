"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

const levelBadge: Record<string, { label: string; color: string }> = {
  lead: { label: "Lead", color: "bg-accent/20 text-accent border border-accent/30" },
  specialist: {
    label: "Specialist",
    color: "bg-info/20 text-info border border-info/30",
  },
  intern: {
    label: "Intern",
    color: "bg-warning/20 text-warning border border-warning/30",
  },
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  idle: { bg: "bg-muted/20", text: "text-muted", label: "IDLE" },
  active: { bg: "bg-success/20", text: "text-success", label: "ACTIVE" },
  working: { bg: "bg-success/20", text: "text-success", label: "WORKING" },
  blocked: { bg: "bg-danger/20", text: "text-danger", label: "BLOCKED" },
};

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

export default function AgentProfile({
  agentId,
}: {
  agentId: Id<"agents">;
}) {
  const agent = useQuery(api.agents.get, { id: agentId });
  const agentTasks = useQuery(api.tasks.getByAgent, { agentId });
  const agentActivities = useQuery(api.activities.listByAgent, {
    agentId,
    limit: 20,
  });
  const notifications = useQuery(api.notifications.getUndeliveredForAgent, {
    agentId,
  });

  const sendChat = useMutation(api.chat.send);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "attention" | "timeline" | "messages"
  >("attention");

  if (!agent) {
    return (
      <div className="w-full bg-card-bg min-h-screen animate-pulse" />
    );
  }

  const badge = levelBadge[agent.level];
  const status = statusColors[agent.status] ?? statusColors.idle;

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    await sendChat({
      fromAgentId: agentId,
      content: messageInput.trim(),
    });
    setMessageInput("");
  };

  const pendingNotifications = notifications?.filter((n) => !n.delivered) ?? [];
  const activeTasks =
    agentTasks?.filter(
      (t) => t.status !== "done" && t.status !== "blocked"
    ) ?? [];

  return (
    <div className="w-full bg-card-bg min-h-screen flex flex-col overflow-hidden">
      {/* Agent Header */}
      <div className="px-5 py-3 border-b border-card-border">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs font-semibold text-foreground tracking-tight">
            AGENT PROFILE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-card-border flex items-center justify-center text-3xl">
            {agent.avatar ?? "🤖"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{agent.name}</h3>
            <p className="text-xs text-muted">{agent.role}</p>
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-1 ${badge.color}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.bg} ${status.text}`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            {status.label}
          </span>
        </div>
      </div>

      {/* About */}
      {agent.about && (
        <div className="px-5 py-3 border-b border-card-border">
          <p className="text-[10px] text-muted font-mono uppercase mb-1.5">
            About
          </p>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {agent.about}
          </p>
        </div>
      )}

      {/* Skills */}
      {agent.skills && agent.skills.length > 0 && (
        <div className="px-5 py-3 border-b border-card-border">
          <p className="text-[10px] text-muted font-mono uppercase mb-2">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.map((skill) => (
              <span
                key={skill}
                className="text-[10px] text-muted bg-surface px-2 py-1 rounded border border-card-border"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 py-2 border-b border-card-border flex gap-1">
        {(["attention", "timeline", "messages"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[11px] px-3 py-1.5 rounded transition-colors capitalize ${
              activeTab === tab
                ? "bg-accent/10 text-accent font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab === "attention" ? `⚡ Attention` : ""}
            {tab === "timeline" ? `📋 Timeline` : ""}
            {tab === "messages" ? `💬 Messages` : ""}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {activeTab === "attention" && (
          <div className="space-y-3">
            <p className="text-[10px] text-muted font-mono uppercase">
              Tasks & mentions needing {agent.name}&apos;s attention
            </p>
            {pendingNotifications.length === 0 && activeTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted">✨ All caught up! No pending items.</p>
              </div>
            ) : (
              <>
                {pendingNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="bg-surface/50 rounded-lg p-3 border border-card-border"
                  >
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {notif.content}
                    </p>
                    <p className="text-[10px] text-muted mt-1 font-mono">
                      {timeAgo(notif._creationTime)}
                    </p>
                  </div>
                ))}
                {activeTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-surface/50 rounded-lg p-3 border border-card-border"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5 line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-3">
            <p className="text-[10px] text-muted font-mono uppercase">
              Recent activity by {agent.name}
            </p>
            {!agentActivities || agentActivities.length === 0 ? (
              <p className="text-center text-xs text-muted py-6">
                No activity yet.
              </p>
            ) : (
              agentActivities.map((act) => (
                <div
                  key={act._id}
                  className="flex gap-2 py-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {act.message}
                    </p>
                    <p className="text-[10px] text-muted font-mono">
                      {timeAgo(act._creationTime)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-3">
            <p className="text-[10px] text-muted font-mono uppercase">
              Recent comments by {agent.name}
            </p>
            <p className="text-center text-xs text-muted py-6">
              Check the task threads for {agent.name}&apos;s comments.
            </p>
          </div>
        )}
      </div>

      {/* Send Message Input */}
      <div className="px-5 py-3 border-t border-card-border">
        <p className="text-[10px] text-muted font-mono uppercase mb-2">
          Send message to {agent.name}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={`Message ${agent.name}... (@ to mention)`}
            className="flex-1 text-xs bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="text-xs bg-accent text-black font-semibold px-3 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
