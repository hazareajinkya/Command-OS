"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

const typeLabels: Record<string, { label: string; icon: string }> = {
  deliverable: { label: "Deliverable", icon: "📦" },
  research: { label: "Research", icon: "🔬" },
  protocol: { label: "Protocol", icon: "📋" },
  notes: { label: "Notes", icon: "📝" },
  draft: { label: "Draft", icon: "✏️" },
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

export default function DocsPanel({ onClose }: { onClose: () => void }) {
  const documents = useQuery(api.documents.list);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  if (!documents) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-card-bg border border-card-border rounded-2xl w-full max-w-3xl h-[80vh] animate-pulse" />
      </div>
    );
  }

  const filtered =
    typeFilter === "all"
      ? documents
      : documents.filter((d) => d.type === typeFilter);

  const selectedDocument = selectedDoc
    ? documents.find((d) => d._id === selectedDoc)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-[280px] flex-shrink-0 border-r border-card-border flex flex-col">
          <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>📄</span>
              <h2 className="text-sm font-bold text-foreground">Docs</h2>
            </div>
            <span className="text-[10px] text-muted font-mono">
              {documents.length} docs
            </span>
          </div>

          {/* Type filter */}
          <div className="px-4 py-2 border-b border-card-border flex flex-wrap gap-1">
            <button
              onClick={() => setTypeFilter("all")}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                typeFilter === "all"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-card-border text-muted"
              }`}
            >
              All
            </button>
            {Object.entries(typeLabels).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                  typeFilter === key
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-card-border text-muted"
                }`}
              >
                {val.icon} {val.label}
              </button>
            ))}
          </div>

          {/* Doc list */}
          <div className="flex-1 overflow-y-auto divide-y divide-card-border/50">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">
                No documents found.
              </p>
            ) : (
              filtered.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => setSelectedDoc(doc._id)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface/50 transition-colors ${
                    selectedDoc === doc._id ? "bg-surface/70" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">
                      {typeLabels[doc.type]?.icon ?? "📄"}
                    </span>
                    <span className="text-[9px] text-muted font-mono uppercase">
                      {doc.type}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {doc.agentName && (
                      <span className="text-[10px] text-accent">
                        {doc.agentName}
                      </span>
                    )}
                    <span className="text-[10px] text-muted font-mono">
                      {timeAgo(doc._creationTime)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-3 border-b border-card-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {selectedDocument?.title ?? "Select a document"}
            </h3>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground text-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {selectedDocument ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono text-accent px-2 py-0.5 rounded bg-accent/10 uppercase">
                    {selectedDocument.type}
                  </span>
                  {selectedDocument.agentName && (
                    <span className="text-[10px] text-muted">
                      by {selectedDocument.agentName}
                    </span>
                  )}
                  {selectedDocument.taskTitle && (
                    <span className="text-[10px] text-muted">
                      • Task: {selectedDocument.taskTitle}
                    </span>
                  )}
                </div>
                <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedDocument.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl mb-2">📄</p>
                <p className="text-muted text-sm">
                  Select a document to view its contents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
