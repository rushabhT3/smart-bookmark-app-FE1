export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };
}
