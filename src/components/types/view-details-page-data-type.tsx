// export interface ViewVideoDetailResponse {
//   success: boolean;
//   data: VideoDetail;
//   liked: boolean;
//   wishlisted: boolean;
//   elapsed_time: string | null;
// }

// export interface VideoDetail {
//   id: number;
//   video1: string; // still stringified JSON, can be parsed into VideoMeta
//   title: string;
//   description: string;
//   publish: "public" | "schedule";
//   schedule: string | null;
//   genre_id: number;
//   director_name: string;
//   duration: string; // e.g. "2:00"
//   profile_pic: string;
//   image: string;
//   created_at: string;
//   updated_at: string;
//   view_count: number;
//   genres: Genre;
// //   subtitles: Subtitle[];
// }

// export interface Genre {
//   id: number;
//   name: string;
//   thumbnail: string;
//   created_at: string;
//   updated_at: string;
// }

// // export interface Subtitle {
// //   // empty for now, but you can extend when data is available
// // }

// export interface VideoMeta {
//   success: boolean;
//   fileId: string;
//   fileName: string;
//   fileSize: number;
//   s3Url: string;
//   s3Key: string;
//   contentType: string;
//   uploadId: string;
//   method: string;
// }




export interface SingleMovieResponse {
  success: boolean;
  message: string;
  data: MovieDetails;
}

export interface MovieDetails {
  _id: string;
  title: string;
  description: string;
  releaseDate: string; // ISO date string
  genre: string[]; // Array of genre IDs
  language: string;
  duration: number;
  cast: string[];
  directors: string[];
  thumbnailUrl: string;
  trailerUrl: string;
  videoUrl: string;
  isPremium: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}
