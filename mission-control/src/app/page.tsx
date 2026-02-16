"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import AgentSidebar from "../components/AgentSidebar";
import AgentProfile from "../components/AgentProfile";
import TaskBoard from "../components/TaskBoard";
import LiveFeed from "../components/LiveFeed";
import TaskDetail from "../components/TaskDetail";
import CreateTask from "../components/CreateTask";
import CreateAgent from "../components/CreateAgent";
import SquadChat from "../components/SquadChat";
import BroadcastModal from "../components/BroadcastModal";
import DocsPanel from "../components/DocsPanel";

function CostCounter() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const globalCosts = useQuery(api.costs.globalStats);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasCosts = globalCosts && globalCosts.entries > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-xs bg-surface border border-card-border text-muted font-mono px-3 py-2 rounded-lg hover:border-accent/50 hover:text-foreground transition-colors flex items-center gap-1.5"
        title="API Usage & Costs"
      >
        <span className="text-xs font-semibold text-muted">$</span>
        {hasCosts ? (
          <span>${globalCosts.totalCost.toFixed(2)}</span>
        ) : (
          <span>$0.00</span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card-bg border border-card-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-card-border bg-surface/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted font-mono uppercase tracking-wider">
                  API Usage
                </p>
                <p className="text-lg font-bold text-foreground font-mono mt-0.5">
                  ${hasCosts ? globalCosts.totalCost.toFixed(4) : "0.0000"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-muted font-mono uppercase">Today</p>
                <p className="text-sm font-bold text-foreground font-mono mt-0.5">
                  ${hasCosts ? globalCosts.todayCost.toFixed(4) : "0.0000"}
                </p>
              </div>
            </div>
            {hasCosts && (
              <div className="flex gap-4 mt-2">
                <p className="text-[9px] text-muted font-mono">
                  Total:{" "}
                  {globalCosts.totalTokens >= 1000000
                    ? `${(globalCosts.totalTokens / 1000000).toFixed(1)}M`
                    : `${(globalCosts.totalTokens / 1000).toFixed(1)}k`}{" "}
                  tokens
                </p>
                <p className="text-[9px] text-muted font-mono">
                  Today:{" "}
                  {globalCosts.todayTokens >= 1000000
                    ? `${(globalCosts.todayTokens / 1000000).toFixed(1)}M`
                    : `${(globalCosts.todayTokens / 1000).toFixed(1)}k`}{" "}
                  tokens
                </p>
              </div>
            )}
          </div>
          <div className="px-4 py-3 max-h-64 overflow-y-auto">
            {hasCosts && globalCosts.agentBreakdown.length > 0 ? (
              <>
                <p className="text-[9px] text-muted font-mono uppercase mb-2">Cost by Agent</p>
                <div className="space-y-1.5">
                  {globalCosts.agentBreakdown.map((item) => {
                    const pct = globalCosts.totalCost > 0 ? (item.cost / globalCosts.totalCost) * 100 : 0;
                    return (
                      <div key={item.agentId}>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="flex items-center gap-1.5 text-foreground/80">
                            <span className="text-sm">{item.agentAvatar}</span>
                            {item.agentName}
                          </span>
                          <span className="font-mono text-muted text-[10px]">${item.cost.toFixed(4)}</span>
                        </div>
                        <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-accent/60 rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted">No usage data yet.</p>
                <p className="text-[10px] text-muted/60 mt-1">Costs appear when agents log token usage.</p>
              </div>
            )}
          </div>
          {hasCosts && (
            <div className="px-4 py-2 border-t border-card-border bg-surface/20">
              <p className="text-[9px] text-muted text-center font-mono">{globalCosts.entries} API calls tracked</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PauseControl() {
  const system = useQuery(api.system.get);
  const pause = useMutation(api.system.pause);
  const unpause = useMutation(api.system.unpause);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (system?.paused) {
        await unpause();
      } else {
        await pause();
      }
    } finally {
      setLoading(false);
    }
  };

  if (system === undefined) {
    return (
      <div className="flex items-center gap-1.5 bg-surface border border-card-border px-3 py-1.5 rounded-full">
        <span className="text-xs text-muted">...</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border font-bold text-xs tracking-wider transition-colors disabled:opacity-60 ${
        system.paused
          ? "bg-amber-500/20 border-amber-500/40 text-amber-600 hover:bg-amber-500/30"
          : "bg-success/10 border-success/20 text-success hover:bg-success/20"
      }`}
      title={system.paused ? "Squad is paused — click to resume" : "Squad is running — click to pause"}
    >
      {system.paused ? (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          PAUSED
        </>
      ) : (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          ONLINE
        </>
      )}
    </button>
  );
}

function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="text-right">
        <p className="text-sm font-mono font-bold text-foreground tracking-wider">--:--:--</p>
        <p className="text-[10px] text-muted font-mono uppercase">---</p>
      </div>
    );
  }

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const date = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="text-right">
      <p className="text-sm font-mono font-bold text-foreground tracking-wider">
        {hours}:{minutes}:{seconds}
      </p>
      <p className="text-[10px] text-muted font-mono uppercase">{date}</p>
    </div>
  );
}

export default function Home() {
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [rightPanel, setRightPanel] = useState<"feed" | "chat">("feed");
  const [panelOpen, setPanelOpen] = useState(true);

  const agentStats = useQuery(api.agents.stats);
  const taskStats = useQuery(api.tasks.stats);

  const handleSelectAgent = (id: Id<"agents"> | null) => {
    setSelectedAgentId(id);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ═══ Top Bar ═══ */}
      <header className="border-b border-card-border bg-card-bg/90 backdrop-blur-sm flex-shrink-0 z-40">
        <div className="px-5 py-3 flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-accent text-sm font-bold tracking-tighter">C</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-widest">
                COMMAND OS
              </h1>
              <p className="text-[10px] text-muted font-mono tracking-wider">
                AI Agent Squad
              </p>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground font-mono leading-none">
                {agentStats?.active ?? 0}
              </p>
              <p className="text-[9px] text-muted font-mono tracking-widest uppercase mt-1">
                Agents Active
              </p>
            </div>
            <div className="w-px h-8 bg-card-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground font-mono leading-none">
                {taskStats?.total ?? 0}
              </p>
              <p className="text-[9px] text-muted font-mono tracking-widest uppercase mt-1">
                Tasks in Queue
              </p>
            </div>
          </div>

          {/* Right: Actions + Clock + Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBroadcast(true)}
              className="text-xs bg-surface border border-card-border text-foreground font-semibold px-3.5 py-2 rounded-lg hover:border-accent/50 transition-colors"
            >
              Broadcast
            </button>
            <button
              onClick={() => setShowDocs(true)}
              className="text-xs bg-surface border border-card-border text-foreground font-semibold px-3.5 py-2 rounded-lg hover:border-accent/50 transition-colors"
            >
              Docs
            </button>

            <CostCounter />

            <div className="w-px h-7 bg-card-border" />

            <Clock />

            <PauseControl />
          </div>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Agent Sidebar */}
        <AgentSidebar
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
          onCreateAgent={() => setShowCreateAgent(true)}
        />

        {/* Center: Task Board */}
        <div className="flex-1 min-w-0 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <div />
            <button
              onClick={() => setShowCreateTask(true)}
              className="text-xs bg-accent text-black font-bold px-4 py-2 rounded-lg hover:bg-accent-dim transition-colors flex items-center gap-1.5"
            >
              + New Task
            </button>
          </div>
          <TaskBoard onSelectTask={setSelectedTaskId} />
        </div>

        {/* Collapse/Expand Toggle Strip */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="flex-shrink-0 w-5 bg-surface/30 hover:bg-surface border-l border-card-border flex items-center justify-center text-muted hover:text-foreground transition-colors group"
          title={panelOpen ? "Collapse panel" : "Expand Live Feed & Chat"}
        >
          <span className="text-sm font-bold group-hover:scale-125 transition-transform">
            {panelOpen ? "›" : "‹"}
          </span>
        </button>

        {/* Right: Collapsible Panel */}
        {panelOpen && (
          <div className="w-[380px] flex-shrink-0 border-l border-card-border flex flex-col">
            {/* Tab Bar */}
            <div className="flex border-b border-card-border flex-shrink-0">
              <button
                onClick={() => setRightPanel("feed")}
                className={`flex-1 px-4 py-3 text-xs font-semibold tracking-wide transition-colors ${
                  rightPanel === "feed"
                    ? "text-accent border-b-2 border-accent bg-accent/5"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Live Feed
              </button>
              <button
                onClick={() => setRightPanel("chat")}
                className={`flex-1 px-4 py-3 text-xs font-semibold tracking-wide transition-colors ${
                  rightPanel === "chat"
                    ? "text-accent border-b-2 border-accent bg-accent/5"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Squad Chat
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {rightPanel === "chat" ? (
                <SquadChat />
              ) : (
                <div className="p-4">
                  <LiveFeed />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ Modals ═══ */}
      {selectedAgentId && (
        <AgentProfile
          agentId={selectedAgentId}
          onClose={() => setSelectedAgentId(null)}
        />
      )}
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
      {showCreateTask && (
        <CreateTask onClose={() => setShowCreateTask(false)} />
      )}
      {showCreateAgent && (
        <CreateAgent onClose={() => setShowCreateAgent(false)} />
      )}
      {showBroadcast && (
        <BroadcastModal onClose={() => setShowBroadcast(false)} />
      )}
      {showDocs && <DocsPanel onClose={() => setShowDocs(false)} />}
    </div>
  );
}
