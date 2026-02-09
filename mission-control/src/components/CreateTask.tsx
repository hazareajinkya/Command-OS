"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

export default function CreateTask({ onClose }: { onClose: () => void }) {
  const agents = useQuery(api.agents.list);
  const createTask = useMutation(api.tasks.create);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [selectedAgents, setSelectedAgents] = useState<Id<"agents">[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAgent = (id: Id<"agents">) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const addTag = () => {
    const tag = tagsInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagsInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        assigneeIds: selectedAgents.length > 0 ? selectedAgents : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            📋 Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Create competitor comparison page"
              className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail..."
              rows={3}
              className="w-full text-sm bg-surface border border-card-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high", "urgent"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                    priority === p
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-card-border text-muted hover:border-muted"
                  }`}
                >
                  {p === "urgent" ? "🚨 " : ""}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag and press Enter..."
                className="flex-1 text-xs bg-surface border border-card-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50"
              />
              <button
                onClick={addTag}
                className="text-xs text-accent hover:text-accent-dim transition-colors px-2"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-muted bg-surface px-2 py-1 rounded border border-card-border flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-muted hover:text-danger text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-muted font-mono uppercase block mb-1.5">
              Assign Agents
            </label>
            <div className="flex flex-wrap gap-2">
              {agents?.map((agent) => (
                <button
                  key={agent._id}
                  onClick={() => toggleAgent(agent._id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedAgents.includes(agent._id)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-card-border text-muted hover:border-muted"
                  }`}
                >
                  {agent.avatar} {agent.name}
                </button>
              ))}
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
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="text-xs bg-accent text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
