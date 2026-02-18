"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Bookmark, LogOut } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  user: {
    id: string;
    email?: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <Bookmark className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            BookmarkVault
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name ?? "User avatar"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-blue-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user.user_metadata?.full_name?.[0] ??
                  user.email?.[0]?.toUpperCase() ??
                  "U"}
              </div>
            )}
            <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">
              {user.user_metadata?.full_name ?? user.email ?? "User"}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
