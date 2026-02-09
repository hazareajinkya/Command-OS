"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

const typeFilters = [
  { key: "all", label: "All" },
  { key: "tasks", label: "Tasks" },
  { key: "comments", label: "Comments" },
  { key: "docs", label: "Docs" },
  { key: "status", label: "Status" },
] as const;

type FilterKey = (typeof typeFilters)[number]["key"];

const typeToFilter: Record<string, FilterKey> = {
  task_created: "tasks",
  task_updated: "tasks",
  task_assigned: "tasks",
  message_sent: "comments",
  document_created: "docs",
  agent_status_changed: "status",
  heartbeat: "status",
  broadcast: "all",
  chat_message: "comments",
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

export default function LiveFeed() {
  const activities = useQuery(api.activities.list, { limit: 100 });
  const agents = useQuery(api.agents.list);
  const [typeFilter, setTypeFilter] = useState<FilterKey>("all");
  const [agentFilter, setAgentFilter] = useState<string | null>(null);

  if (!activities || !agents) {
    return (
      <div className="bg-card-bg border border-card-border rounded-xl p-4 min-h-[400px] animate-pulse" />
    );
  }

  // Count activities per agent
  const agentCounts: Record<string, number> = {};
  for (const act of activities) {
    if (act.agentName) {
      agentCounts[act.agentName] = (agentCounts[act.agentName] ?? 0) + 1;
    }
  }

  // Filter activities
  const filtered = activities.filter((act) => {
    if (typeFilter !== "all") {
      const mapped = typeToFilter[act.type] ?? "all";
      if (mapped !== typeFilter && mapped !== "all") return false;
    }
    if (agentFilter) {
      if (act.agentName !== agentFilter) return false;
    }
    return true;
  });

  // Count by type filters
  const typeCounts: Record<string, number> = { all: activities.length };
  for (const act of activities) {
    const mapped = typeToFilter[act.type] ?? "all";
    typeCounts[mapped] = (typeCounts[mapped] ?? 0) + 1;
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-card-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <h2 className="text-xs font-semibold text-foreground tracking-tight">
              LIVE FEED
            </h2>
          </div>
          <span className="text-[10px] text-muted font-mono">
            LIVE
          </span>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-1 mb-2">
          {typeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                typeFilter === f.key
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-card-border text-muted hover:border-muted"
              }`}
            >
              {f.label}{" "}
              <span className="opacity-60">{typeCounts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Agent Filters */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setAgentFilter(null)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
              agentFilter === null
                ? "border-accent bg-accent/10 text-accent font-semibold"
                : "border-card-border text-muted hover:border-muted"
            }`}
          >
            All Agents
          </button>
          {agents
            .filter((a) => agentCounts[a.name])
            .sort(
              (a, b) =>
                (agentCounts[b.name] ?? 0) - (agentCounts[a.name] ?? 0)
            )
            .map((agent) => (
              <button
                key={agent._id}
                onClick={() =>
                  setAgentFilter(
                    agentFilter === agent.name ? null : agent.name
                  )
                }
                className={`text-[10px] px-2 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                  agentFilter === agent.name
                    ? "border-accent bg-accent/10 text-accent font-semibold"
                    : "border-card-border text-muted hover:border-muted"
                }`}
              >
                {agent.avatar} {agent.name}{" "}
                <span className="opacity-60">
                  {agentCounts[agent.name] ?? 0}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Feed */}
      <div className="max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted text-xs">No activity matches filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-card-border/50">
            {filtered.map((activity) => (
              <div
                key={activity._id}
                className="px-4 py-2.5 hover:bg-surface/30 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {activity.agentAvatar ?? "📌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground/90 leading-relaxed">
                      {activity.agentName && (
                        <span className="font-semibold text-accent">
                          {activity.agentName}
                        </span>
                      )}{" "}
                      {activity.message}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5 font-mono">
                      {timeAgo(activity._creationTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
