"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const levelBadge: Record<string, { label: string; color: string }> = {
  lead: { label: "LEAD", color: "bg-accent/20 text-accent" },
  specialist: { label: "SPC", color: "bg-info/20 text-info" },
  intern: { label: "INT", color: "bg-warning/20 text-warning" },
};

const statusColor: Record<string, string> = {
  idle: "bg-muted",
  active: "bg-success",
  working: "bg-success",
  blocked: "bg-danger",
};

export default function AgentSidebar({
  selectedAgentId,
  onSelectAgent,
}: {
  selectedAgentId: Id<"agents"> | null;
  onSelectAgent: (id: Id<"agents"> | null) => void;
}) {
  const agents = useQuery(api.agents.list);

  if (!agents) {
    return (
      <div className="w-[220px] flex-shrink-0 bg-card-bg border-r border-card-border min-h-screen animate-pulse" />
    );
  }

  const activeCount = agents.filter(
    (a) => a.status === "active" || a.status === "working"
  ).length;

  return (
    <div className="w-[220px] flex-shrink-0 bg-card-bg border-r border-card-border min-h-screen overflow-y-auto">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold text-foreground tracking-tight">
            AGENTS
          </span>
        </div>
        <span className="text-[10px] text-muted font-mono bg-surface px-1.5 py-0.5 rounded">
          {agents.length}
        </span>
      </div>

      {/* All Agents Button */}
      <button
        onClick={() => onSelectAgent(null)}
        className={`w-full px-4 py-3 border-b border-card-border flex items-center gap-3 hover:bg-surface/50 transition-colors ${
          selectedAgentId === null ? "bg-surface/70" : ""
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-accent text-sm">⚡</span>
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold text-foreground">All Agents</p>
          <p className="text-[10px] text-muted">
            {agents.length} total
            <span className="text-success ml-1">
              • {activeCount} ACTIVE
            </span>
          </p>
        </div>
      </button>

      {/* Agent List */}
      <div className="divide-y divide-card-border/50">
        {agents.map((agent) => {
          const badge = levelBadge[agent.level];
          const isSelected = selectedAgentId === agent._id;
          return (
            <button
              key={agent._id}
              onClick={() => onSelectAgent(agent._id)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-surface/50 transition-all text-left ${
                isSelected ? "bg-surface/70 border-l-2 border-l-accent" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-base flex-shrink-0">
                {agent.avatar ?? "🤖"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {agent.name}
                  </span>
                  <span
                    className={`text-[8px] font-bold px-1 py-0.5 rounded ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted truncate">{agent.role}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${statusColor[agent.status] ?? "bg-muted"}`}
                />
                <span className="text-[9px] text-muted font-mono uppercase">
                  {agent.status === "working" ? "WORKING" : agent.status.toUpperCase()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
