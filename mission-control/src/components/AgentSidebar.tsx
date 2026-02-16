"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";

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
  onCreateAgent,
}: {
  selectedAgentId: Id<"agents"> | null;
  onSelectAgent: (id: Id<"agents"> | null) => void;
  onCreateAgent?: () => void;
}) {
  const agents = useQuery(api.agents.list);

  if (!agents) {
    return (
      <div className="w-[240px] flex-shrink-0 bg-card-bg border-r border-card-border min-h-screen animate-pulse" />
    );
  }

  const activeCount = agents.filter(
    (a) => a.status === "active" || a.status === "working"
  ).length;

  return (
    <div className="w-[240px] flex-shrink-0 bg-card-bg border-r border-card-border flex flex-col">
      {/* Section Header */}
      <div className="px-4 py-3.5 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-semibold text-foreground tracking-tight">
            AGENTS
          </span>
        </div>
        <span className="text-xs text-muted font-mono bg-surface px-2 py-0.5 rounded">
          {agents.length}
        </span>
      </div>

      {/* All Agents Button */}
      <button
        onClick={() => onSelectAgent(null)}
        className={`w-full px-4 py-3.5 border-b border-card-border flex items-center gap-3 hover:bg-surface/50 transition-colors ${
          selectedAgentId === null ? "bg-surface/70" : ""
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
          <span className="text-accent text-xs font-bold">ALL</span>
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">All Agents</p>
          <p className="text-xs text-muted">
            {agents.length} total
            <span className="text-success ml-1">
              • {activeCount} active
            </span>
          </p>
        </div>
      </button>

      {/* Agent List */}
      <div className="divide-y divide-card-border/50 flex-1 overflow-y-auto">
        {agents.map((agent) => {
          const badge = levelBadge[agent.level];
          const isSelected = selectedAgentId === agent._id;
          return (
            <button
              key={agent._id}
              onClick={() => onSelectAgent(agent._id)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-surface/50 transition-all text-left ${
                isSelected ? "bg-surface/70 border-l-2 border-l-accent" : ""
              }`}
            >
              {/* Profile Photo or Emoji Fallback */}
              {agent.profileImage ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-card-border">
                  <Image
                    src={agent.profileImage}
                    alt={agent.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-muted flex-shrink-0 border border-card-border">
                  {agent.name.slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {agent.name}
                  </span>
                  <span
                    className={`text-[8px] font-bold px-1 py-0.5 rounded ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">{agent.role}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${statusColor[agent.status] ?? "bg-muted"}`}
                />
                <span className="text-[9px] text-muted font-mono uppercase">
                  {agent.status === "working" ? "WORK" : agent.status.toUpperCase()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Create Agent Button */}
      {onCreateAgent && (
        <div className="px-3 py-3 border-t border-card-border flex-shrink-0">
          <button
            onClick={onCreateAgent}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-card-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
          >
            <span className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-sm group-hover:bg-accent/20 transition-colors">
              +
            </span>
            <span className="text-xs font-semibold text-muted group-hover:text-foreground transition-colors">
              Deploy New Agent
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
