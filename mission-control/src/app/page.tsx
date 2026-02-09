"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import AgentSidebar from "../components/AgentSidebar";
import AgentProfile from "../components/AgentProfile";
import TaskBoard from "../components/TaskBoard";
import LiveFeed from "../components/LiveFeed";
import TaskDetail from "../components/TaskDetail";
import CreateTask from "../components/CreateTask";
import SquadChat from "../components/SquadChat";
import BroadcastModal from "../components/BroadcastModal";
import DocsPanel from "../components/DocsPanel";

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const date = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="text-right">
      <p className="text-sm font-mono font-bold text-foreground tracking-wider">
        {hours}:{minutes}:{seconds}
      </p>
      <p className="text-[9px] text-muted font-mono uppercase">{date}</p>
    </div>
  );
}

export default function Home() {
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [rightPanel, setRightPanel] = useState<"feed" | "profile">("feed");

  const agentStats = useQuery(api.agents.stats);
  const taskStats = useQuery(api.tasks.stats);

  // When an agent is selected from sidebar, show profile
  const handleSelectAgent = (id: Id<"agents"> | null) => {
    setSelectedAgentId(id);
    setRightPanel(id ? "profile" : "feed");
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ═══ Top Bar ═══ */}
      <header className="border-b border-card-border bg-card-bg/90 backdrop-blur-sm flex-shrink-0 z-40">
        <div className="px-4 py-2.5 flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-sm">◇</span>
            </div>
            <div>
              <h1 className="text-xs font-bold text-foreground tracking-widest">
                MISSION CONTROL
              </h1>
              <p className="text-[9px] text-muted font-mono tracking-wider">
                Stark Industries
              </p>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground font-mono">
                {agentStats?.active ?? 0}
              </p>
              <p className="text-[8px] text-muted font-mono tracking-widest uppercase">
                Agents Active
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground font-mono">
                {taskStats?.total ?? 0}
              </p>
              <p className="text-[8px] text-muted font-mono tracking-widest uppercase">
                Tasks in Queue
              </p>
            </div>
          </div>

          {/* Right: Actions + Clock + Status */}
          <div className="flex items-center gap-3">
            {/* Action Buttons */}
            <button
              onClick={() => setShowCreateTask(true)}
              className="text-[10px] bg-surface border border-card-border text-foreground font-semibold px-3 py-1.5 rounded-lg hover:border-accent/50 transition-colors flex items-center gap-1.5"
            >
              📌 Active
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="text-[10px] bg-surface border border-card-border text-foreground font-semibold px-3 py-1.5 rounded-lg hover:border-accent/50 transition-colors flex items-center gap-1.5"
            >
              💬 Chat
            </button>
            <button
              onClick={() => setShowBroadcast(true)}
              className="text-[10px] bg-surface border border-card-border text-foreground font-semibold px-3 py-1.5 rounded-lg hover:border-accent/50 transition-colors flex items-center gap-1.5"
            >
              📢 Broadcast
            </button>
            <button
              onClick={() => setShowDocs(true)}
              className="text-[10px] bg-surface border border-card-border text-foreground font-semibold px-3 py-1.5 rounded-lg hover:border-accent/50 transition-colors flex items-center gap-1.5"
            >
              📄 Docs
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-card-border mx-1" />

            {/* Clock */}
            <Clock />

            {/* Online Status */}
            <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success font-bold tracking-wider">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Main Content: 3-Column Layout ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Agent Sidebar */}
        <AgentSidebar
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
        />

        {/* Center: Mission Queue (Task Board) */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4">
          {/* + New Task Button */}
          <div className="flex items-center justify-between mb-3">
            <div />
            <button
              onClick={() => setShowCreateTask(true)}
              className="text-[10px] bg-accent text-black font-bold px-3 py-1.5 rounded-lg hover:bg-accent-dim transition-colors flex items-center gap-1"
            >
              + New Task
            </button>
          </div>
          <TaskBoard onSelectTask={setSelectedTaskId} />
        </div>

        {/* Right: Live Feed or Agent Profile */}
        <div className="w-[360px] flex-shrink-0 border-l border-card-border overflow-y-auto">
          {rightPanel === "profile" && selectedAgentId ? (
            <AgentProfile agentId={selectedAgentId} />
          ) : (
            <div className="p-4">
              <LiveFeed />
            </div>
          )}
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
      {showCreateTask && (
        <CreateTask onClose={() => setShowCreateTask(false)} />
      )}
      {showChat && <SquadChat onClose={() => setShowChat(false)} />}
      {showBroadcast && (
        <BroadcastModal onClose={() => setShowBroadcast(false)} />
      )}
      {showDocs && <DocsPanel onClose={() => setShowDocs(false)} />}
    </div>
  );
}
