"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookmarkCard } from "./BookmarkCard";
import { Bookmark, Search, BookmarkX, Wifi } from "lucide-react";
import type { Bookmark as BookmarkType } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface BookmarkListProps {
  initialBookmarks: BookmarkType[];
  userId: string;
  userName: string;
}

export function BookmarkList({ initialBookmarks, userId, userName }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(initialBookmarks);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as BookmarkType;
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
          setNewIds((prev) => new Set([...prev, newBookmark.id]));
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(newBookmark.id);
              return next;
            });
          }, 2000);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Ensure you are checking payload.old.id
          const deletedId = payload.old.id;
          setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as BookmarkType;
          setBookmarks((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setRealtimeStatus("disconnected");
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const filtered = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    
    <div className="space-y-8"> {/* Changed to space-y-8 to match original layout */}
      {/* Moved from Page.tsx to here */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">
            Welcome back, <span className="text-slate-800 font-semibold">{userName}</span> 👋
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Your vault is private and synced in real-time</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{bookmarks.length}</p>
          <p className="text-xs text-slate-400">{bookmarks.length === 1 ? "bookmark" : "bookmarks"} saved</p>
        </div>
      </div>


      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
          />
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-500 ${
            realtimeStatus === "connected"
              ? "bg-green-50 text-green-700 border-green-200"
              : realtimeStatus === "connecting"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {realtimeStatus === "connected"
              ? "Live"
              : realtimeStatus === "connecting"
              ? "Syncing..."
              : "Offline"}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              realtimeStatus === "connected"
                ? "bg-green-500 animate-pulse"
                : realtimeStatus === "connecting"
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-600">
          {searchQuery
            ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"`
            : `Your Bookmarks (${bookmarks.length})`}
        </h2>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={handleDelete}
              isNew={newIds.has(bookmark.id)}
            />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl">
            <Bookmark className="w-8 h-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-600">No bookmarks yet</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Add your first bookmark above to start building your personal
              knowledge vault.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl">
            <BookmarkX className="w-7 h-7 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-slate-600">No results found</h3>
            <p className="text-sm text-slate-400">
              No bookmarks match &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
