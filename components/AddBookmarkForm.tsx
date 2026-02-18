"use client";

import { useState, useTransition, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Link2, Tag, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";

interface AddBookmarkFormProps {
  userId: string;
}

function extractFavicon(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
  } catch {
    return null;
  }
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

const urlSchema = z.url().refine((val) => val.includes("."), {
  message: "Invalid domain format",
});

export function AddBookmarkForm({ userId }: AddBookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const normalizedUrl = normalizeUrl(url);
    const result = urlSchema.safeParse(normalizedUrl);

    if (!result.success) {
      setError("Please enter a valid URL (e.g., https://google.com)");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for your bookmark");
      return;
    }

    startTransition(async () => {
      const faviconUrl = extractFavicon(normalizedUrl);

      const { error: insertError } = await supabase.from("bookmarks").insert({
        user_id: userId,
        url: normalizedUrl,
        title: title.trim(),
        favicon_url: faviconUrl,
      });

      if (insertError) {
        setError("Failed to save bookmark. Please try again.");
        console.error(insertError);
        return;
      }

      setUrl("");
      setTitle("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
          <Plus className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="font-semibold text-slate-800">Add New Bookmark</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="url"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1"
            >
              <Link2 className="w-3 h-3" />
              URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="title"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My favorite article"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
              disabled={isPending}
              maxLength={200}
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
            <span>⚠</span>
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-100 rounded-xl px-4 py-3 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Bookmark saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !url.trim() || !title.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none text-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Save Bookmark
            </>
          )}
        </button>
      </form>
    </div>
  );
}
