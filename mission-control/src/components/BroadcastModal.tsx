"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function BroadcastModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const sendBroadcast = useMutation(api.broadcasts.send);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await sendBroadcast({
        title: title.trim() || undefined,
        message: message.trim(),
        priority,
      });
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📢</span>
            <h2 className="text-sm font-bold text-foreground">
              Squad Announcement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Strategic Direction Change"
              className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Message <span className="text-danger">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement to the squad..."
              rows={4}
              className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPriority("normal")}
                className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                  priority === "normal"
                    ? "border-accent bg-accent/10 text-accent font-semibold"
                    : "border-card-border text-muted hover:border-muted"
                }`}
              >
                NORMAL
              </button>
              <button
                onClick={() => setPriority("urgent")}
                className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                  priority === "urgent"
                    ? "border-danger bg-danger/10 text-danger font-semibold"
                    : "border-card-border text-muted hover:border-muted"
                }`}
              >
                🚨 URGENT
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-card-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-xs text-muted hover:text-foreground px-4 py-2.5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="text-xs bg-accent text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30 flex items-center gap-2"
          >
            <span>📢</span>
            {isSending ? "Sending..." : "Broadcast to Squad"}
          </button>
        </div>
      </div>
    </div>
  );
}
