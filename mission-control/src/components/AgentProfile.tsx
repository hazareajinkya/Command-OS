"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";

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
  const agentCosts = useQuery(api.costs.agentStats, { agentId });
  const directMessages = useQuery(api.directMessages.listByAgent, { agentId });

  const sendChat = useMutation(api.chat.send);
  const sendDM = useMutation(api.directMessages.sendFromCommander);
  const [messageInput, setMessageInput] = useState("");
  const [dmInput, setDmInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "commander_chat" | "attention" | "timeline" | "messages" | "usage"
  >("commander_chat");
  const dmScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll DM chat — must be before any early returns (Rules of Hooks)
  useEffect(() => {
    if (dmScrollRef.current && activeTab === "commander_chat") {
      dmScrollRef.current.scrollTop = dmScrollRef.current.scrollHeight;
    }
  }, [directMessages, activeTab]);

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

  const handleSendDM = async () => {
    if (!dmInput.trim()) return;
    await sendDM({
      agentId,
      content: dmInput.trim(),
    });
    setDmInput("");
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
      <div className="px-5 py-2 border-b border-card-border flex gap-1 overflow-x-auto">
        {(["commander_chat", "attention", "timeline", "messages", "usage"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[11px] px-3 py-1.5 rounded transition-colors capitalize whitespace-nowrap flex items-center gap-1 ${
              activeTab === tab
                ? "bg-accent/10 text-accent font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab === "commander_chat" && (
              <>
                🎖️ Chat
                {directMessages && directMessages.filter((m) => !m.isFromCommander).length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                )}
              </>
            )}
            {tab === "attention" && "⚡ Attention"}
            {tab === "timeline" && "📋 Timeline"}
            {tab === "messages" && "💬 Squad"}
            {tab === "usage" && "💲 Usage"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Commander Chat Tab */}
        {activeTab === "commander_chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages */}
            <div
              ref={dmScrollRef}
              className="flex-1 overflow-y-auto px-5 py-3 space-y-3"
            >
              {!directMessages || directMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl mx-auto mb-3">
                    {agent.avatar ?? "🤖"}
                  </div>
                  <p className="text-xs text-foreground font-medium mb-1">
                    Start a conversation with {agent.name}
                  </p>
                  <p className="text-[10px] text-muted leading-relaxed max-w-[250px] mx-auto">
                    This is your private channel with {agent.name}.
                    They can suggest tasks, report status, and discuss work
                    directly with you.
                  </p>
                </div>
              ) : (
                directMessages.map((msg) => {
                  const isSystem = msg.messageType === "system";
                  const isTaskSuggestion = msg.messageType === "task_suggestion";
                  const isCommander = msg.isFromCommander;

                  if (isSystem) {
                    return (
                      <div
                        key={msg._id}
                        className="text-center py-2"
                      >
                        <p className="text-[10px] text-muted bg-surface/50 inline-block px-3 py-1.5 rounded-full">
                          {msg.content}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-2.5 ${isCommander ? "flex-row-reverse" : ""}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                          isCommander
                            ? "bg-accent/20 text-accent"
                            : "bg-surface border border-card-border"
                        }`}
                      >
                        {isCommander ? "🎖️" : agent.avatar ?? "🤖"}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          isCommander
                            ? "bg-accent/10 border border-accent/20"
                            : isTaskSuggestion
                              ? "bg-success/5 border border-success/20"
                              : "bg-surface/50 border border-card-border"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-semibold text-foreground/70">
                            {isCommander ? "Commander" : agent.name}
                          </span>
                          {isTaskSuggestion && (
                            <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded font-bold">
                              SUGGESTION
                            </span>
                          )}
                          <span className="text-[9px] text-muted font-mono">
                            {timeAgo(msg._creationTime)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DM Input */}
            <div className="px-5 py-3 border-t border-card-border flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendDM()}
                  placeholder={`Message ${agent.name}...`}
                  className="flex-1 text-xs bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
                />
                <button
                  onClick={handleSendDM}
                  disabled={!dmInput.trim()}
                  className="text-xs bg-accent text-black font-semibold px-3 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs wrapped in scrollable container */}
        {activeTab !== "commander_chat" && (
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

        {activeTab === "usage" && (
          <div className="space-y-4">
            <p className="text-[10px] text-muted font-mono uppercase">
              Token &amp; Cost Usage for {agent.name}
            </p>
            {agentCosts && agentCosts.entries > 0 ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-surface/50 rounded-lg p-3 border border-card-border text-center">
                    <p className="text-xl font-bold text-foreground font-mono">
                      ${agentCosts.totalCost.toFixed(4)}
                    </p>
                    <p className="text-[9px] text-muted font-mono uppercase mt-0.5">
                      Total Spend
                    </p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-3 border border-card-border text-center">
                    <p className="text-xl font-bold text-foreground font-mono">
                      {agentCosts.totalTokens >= 1000000
                        ? `${(agentCosts.totalTokens / 1000000).toFixed(1)}M`
                        : `${(agentCosts.totalTokens / 1000).toFixed(1)}k`}
                    </p>
                    <p className="text-[9px] text-muted font-mono uppercase mt-0.5">
                      Total Tokens
                    </p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-3 border border-card-border text-center">
                    <p className="text-lg font-bold text-foreground font-mono">
                      {(agentCosts.promptTokens / 1000).toFixed(1)}k
                    </p>
                    <p className="text-[9px] text-muted font-mono uppercase mt-0.5">
                      Input Tokens
                    </p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-3 border border-card-border text-center">
                    <p className="text-lg font-bold text-foreground font-mono">
                      {(agentCosts.completionTokens / 1000).toFixed(1)}k
                    </p>
                    <p className="text-[9px] text-muted font-mono uppercase mt-0.5">
                      Output Tokens
                    </p>
                  </div>
                </div>

                {/* By Model */}
                {agentCosts.byModel.length > 0 && (
                  <div>
                    <p className="text-[9px] text-muted font-mono uppercase mb-2">
                      By Model
                    </p>
                    <div className="space-y-1.5">
                      {agentCosts.byModel.map((m) => (
                        <div
                          key={m.model}
                          className="flex items-center justify-between bg-surface/50 rounded px-3 py-2 border border-card-border"
                        >
                          <span className="text-[10px] text-foreground/80 font-mono truncate max-w-[60%]">
                            {m.model.split("/").pop()}
                          </span>
                          <span className="text-[10px] font-mono text-muted">
                            {(m.tokens / 1000).toFixed(1)}k •{" "}
                            <span className="text-foreground font-semibold">
                              ${m.cost.toFixed(4)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* By Action */}
                {agentCosts.byAction.length > 0 && (
                  <div>
                    <p className="text-[9px] text-muted font-mono uppercase mb-2">
                      By Action
                    </p>
                    <div className="space-y-1.5">
                      {agentCosts.byAction.map((a) => (
                        <div
                          key={a.action}
                          className="flex items-center justify-between bg-surface/50 rounded px-3 py-2 border border-card-border"
                        >
                          <span className="text-[10px] text-foreground/80 capitalize">
                            {a.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] font-mono text-muted">
                            {(a.tokens / 1000).toFixed(1)}k •{" "}
                            <span className="text-foreground font-semibold">
                              ${a.cost.toFixed(4)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-muted text-center pt-1">
                  {agentCosts.entries} usage entries recorded
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-muted">
                  No usage data recorded yet.
                </p>
                <p className="text-[10px] text-muted/60 mt-1">
                  Cost tracking activates when {agent.name} logs token usage.
                </p>
              </div>
            )}
          </div>
        )}
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
