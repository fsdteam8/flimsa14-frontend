export interface HomePageApiResponse {
  success: boolean;
  data: {
    genre_names: string[];
    popular: ContentItem[];
    upcoming: ContentItem[];
    weekly_top: ContentItem[];
    latest: ContentItem[];
    "reality tv": ContentItem[];
    cooking: ContentItem[];
    romance: ContentItem[];
    documentary: ContentItem[];
  };
}

export interface ContentItem {
  id: number;
  title: string;
  description: string;
  image: string;
  video1: string;
  publish: "public" | "schedule";
  schedule: string | null;
  view_count: number;
  created_at: string;
  genre_name: string;
  director_name: string;
  profile_pic: string;
}
