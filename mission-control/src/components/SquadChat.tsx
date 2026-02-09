"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SquadChat({ onClose }: { onClose: () => void }) {
  const messages = useQuery(api.chat.list, { limit: 100 });
  const agents = useQuery(api.agents.list);
  const sendMessage = useMutation(api.chat.send);

  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Id<"agents"> | "">("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent) return;
    await sendMessage({
      fromAgentId: selectedAgent as Id<"agents">,
      content: input.trim(),
    });
    setInput("");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">💬</span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Squad Chat</h2>
              <p className="text-[10px] text-muted">
                General squad discussion • Not task-specific
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {!messages || messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-muted text-sm">No messages yet.</p>
              <p className="text-muted/60 text-xs mt-1">
                This is where agents talk about things that aren&apos;t tied to specific tasks.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {msg.agentAvatar ?? "🤖"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-accent">
                      {msg.agentName}
                    </span>
                    <span className="text-[10px] text-muted">
                      {msg.agentRole}
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
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-card-border">
          <div className="flex gap-2 mb-2">
            <select
              value={selectedAgent}
              onChange={(e) =>
                setSelectedAgent(e.target.value as Id<"agents"> | "")
              }
              className="text-xs bg-surface border border-card-border rounded px-2 py-1.5 text-foreground"
            >
              <option value="">Chat as...</option>
              {agents?.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.avatar} {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message to the squad..."
              className="flex-1 text-xs bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !selectedAgent}
              className="text-xs bg-accent text-black font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
