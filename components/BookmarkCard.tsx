"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, Trash2, Loader2, Clock } from "lucide-react";
import Image from "next/image";
import type { Bookmark } from "@/lib/types";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function BookmarkCard({
  bookmark,
  onDelete,
  isNew = false,
}: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm(`Delete "${bookmark.title}"?`)) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmark.id);

    if (error) {
      console.error("Delete error:", error);
      setIsDeleting(false);
      return;
    }

    onDelete(bookmark.id);
  };

  return (
    <div
      className={`group bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 hover:shadow-md hover:border-blue-200/80 transition-all duration-200 hover:-translate-y-0.5 ${
        isNew ? "animate-slide-in ring-2 ring-blue-400/30 ring-offset-2" : ""
      } ${isDeleting ? "opacity-50 scale-[0.98] pointer-events-none" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
          {bookmark.favicon_url && !imgError ? (
            <Image
              src={bookmark.favicon_url}
              alt={`${getDomain(bookmark.url)} favicon`}
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <span className="text-lg font-bold text-slate-400">
              {getDomain(bookmark.url)[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
              {bookmark.title}
            </h3>

            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
                title="Open bookmark"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                title="Delete bookmark"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-blue-500 transition-colors truncate block"
          >
            {getDomain(bookmark.url)}
          </a>

          <div className="flex items-center gap-1 text-xs text-slate-300">
            <Clock className="w-3 h-3" />
            <span>{formatDate(bookmark.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
