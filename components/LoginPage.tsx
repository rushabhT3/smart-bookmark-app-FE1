"use client";

import { createClient } from "@/lib/supabase/client";
import { Bookmark, Lock, Zap, Globe, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.refresh();
        return;
      }
      setIsLoading(false);
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.refresh();
        return;
      }
    });
    
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/25 mb-2">
            <Bookmark className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            BookmarkVault
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Save what matters. Access it anywhere.
            <br />
            <span className="text-blue-500 font-medium">
              Synced in real-time.
            </span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: Lock, text: "Private & Secure" },
            { icon: Zap, text: "Real-time Sync" },
            { icon: Globe, text: "Access Anywhere" },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-slate-600 text-xs font-medium rounded-full border border-slate-200/80 shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-blue-500" />
              {text}
            </span>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl shadow-xl shadow-slate-200/50 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800">
              Get started for free
            </h2>
            <p className="text-slate-500 text-sm mt-1">No credit card required</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            By signing in, you agree to our{" "}
            <span className="text-blue-500 cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-blue-500 cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400">
          🔒 Your bookmarks are encrypted and private — only you can see them
        </p>
      </div>
    </div>
  );
}
