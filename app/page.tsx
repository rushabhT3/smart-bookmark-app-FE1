import { createClient } from "@/lib/supabase/server";
import { LoginPage } from "@/components/LoginPage";
import { Header } from "@/components/Header";
import { BookmarkList } from "@/components/BookmarkList";
import { AddBookmarkForm } from "@/components/AddBookmarkForm";
import type { Bookmark } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginPage />;
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
  }

  const fullName = user.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen">
      <Header user={user} />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <AddBookmarkForm userId={user.id} />

        <BookmarkList
          initialBookmarks={(bookmarks as Bookmark[]) ?? []}
          userId={user.id}
          userName={fullName}
        />
      </main>
    </div>
  );
}
