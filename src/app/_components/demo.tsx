import VideoPlayer from "@/components/video/VideoPlayer";


export default function DemoVideo() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Watch Video</h1>
        <VideoPlayer
          src="https://filmvideos.s3.us-east-2.amazonaws.com/outputs/uploads/raw/1760502635240-ep+3+1/1760502635240-ep+3+1.m3u8"
          poster="/path/to/thumbnail.jpg" // Optional: Add a thumbnail URL
          title="Episode 3 Video"
          className="mx-auto"
          movieId="1760502635240"
          contentType="movie"
        />
      </div>
    </div>
  );
}
