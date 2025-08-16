export interface ContentResponse {
  success: boolean;
  message: string;
  data: PaginationData;
}

export interface PaginationData {
  current_page: number;
  data: ContentItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ContentItem {
  id: number;
  video1: string; // JSON string → if you parse it, see VideoInfo below
  title: string;
  director_name: string;
  profile_pic: string;
  description: string;
  publish: "public" | "private" | "schedule"; // enum-like
  duration: string;
  schedule: string | null;
  genre_id: number;
  image: string;
  created_at: string;
  total_view: number;
  total_likes: number;
  genre_name: string;
  total_watch_time: string;
}

// Optional: Parsed version of `video1`
export interface VideoInfo {
  success: boolean;
  fileId: string;
  fileName: string;
  fileSize: number;
  s3Url: string;
  s3Key: string;
  contentType: string;
  uploadId: string;
  method: string;
}
