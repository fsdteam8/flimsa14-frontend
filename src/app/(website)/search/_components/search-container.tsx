"use client";

import ViewDetails from "@/app/_components/view-details";
import { useSocket } from "@/components/provider/SocketProvider";
import { ApiResponse, Movie } from "@/types/search-data-type";
import type { Series } from "@/types/series";
import { Search, X } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import SeriesModal from "@/components/common/series-modal";

const SearchContainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [activeTab, setActiveTab] = useState<"movies" | "series">("movies");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);



  const { socket, isConnected } = useSocket();

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Emit search event
  useEffect(() => {
    if (!socket || !isConnected || !debouncedTerm) return;
    socket.emit("search", { query: debouncedTerm });
  }, [debouncedTerm, socket, isConnected]);

  // Listen for server results
  useEffect(() => {
    if (!socket) return;

    const handleResults = (data: ApiResponse) => {
      setMovies(data.movies || []);
      setSeries(data.series || []);
    };

    socket.on("searchResults", handleResults);

    return () => {
      socket.off("searchResults", handleResults);
    };
  }, [socket]);

  // Input change
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setMovies([]);
    setSeries([]);
  };

  return (
    <div className=" ">
      <div className="container mx-auto pt-5 md:pt-6 lg:pt-7">
        <div className="w-full flex flex-col items-center  relative">
          <div className="w-full h-[60px] flex items-center  border border-gray-300 rounded-[12px] pl-3 pr-10">
            <Search className="w-5 h-5 text-white mr-3" />
            <input
              type="text"
              placeholder={isConnected ? "Search..." : "Connecting..."}
              disabled={!isConnected}
              className="bg-transparent text-white placeholder-gray-400 outline-none w-full text-base focus:ring-0 transition duration-200 disabled:opacity-50"
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <X
                className="w-5 h-5 text-white cursor-pointer absolute right-3"
                onClick={clearSearch}
              />
            )}
          </div>

          {/* Dropdown results */}
          {/* <div>
            {(movies.length > 0 || series.length > 0) && (
            <ul className="w-full mt-2 max-h-60 overflow-y-auto bg-gray-700 rounded-md p-2">
              {movies.map((m) => (
                <li
                  key={m._id}
                  className="text-white p-2 hover:bg-gray-600 rounded cursor-pointer"
                >
                  {m.title} (Movie)
                </li>
              ))}
              {series.map((s) => (
                <li
                  key={s._id}
                  className="text-white p-2 hover:bg-gray-600 rounded cursor-pointer"
                >
                  {s.title} (Series)
                </li>
              ))}
            </ul>
          )}
        </div> */}

          {/* cart data  */}
          <div className="container mx-auto">
            <div className="px-4 pt-6">
              <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/5 p-1 text-sm text-white">
                {(["movies", "series"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-5 py-2 transition ${
                      activeTab === tab ? "bg-white text-black" : "text-white/70"
                    }`}
                  >
                    {tab === "movies" ? "Movies" : "Series"}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 w-full">
              {activeTab === "movies" ? (
                movies?.length ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {movies.map((movie) => (
                      <button
                        key={movie._id}
                        onClick={() => {
                          setSelectedMovieId(movie._id);
                          setMovieModalOpen(true);
                        }}
                        className="overflow-hidden rounded-2xl bg-black/40 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                      >
                        <div
                          className="h-48 w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${movie.thumbnailUrl})`,
                          }}
                        />
                        <div className="space-y-1 px-4 py-3">
                          <h3 className="text-lg font-semibold text-white">
                            {movie.title}
                          </h3>
                          <p className="text-sm text-white/60">
                            {movie.genre?.[0]?.title ||
                              movie.genre?.[0]?.name ||
                              "No genre"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-white/70">
                    No movies found.
                  </div>
                )
              ) : series?.length ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {series.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => setSelectedSeries(item)}
                      className="overflow-hidden rounded-2xl bg-black/40 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div
                        className="h-48 w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.thumbnailUrl})`,
                        }}
                      />
                      <div className="space-y-1 px-4 py-3">
                        <h3 className="text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/60">
                          {item.genre?.[0]?.title ||
                            item.genre?.[0]?.name ||
                            "No genre"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-white/70">
                  No series found.
                </div>
              )}
            </div>

            {movieModalOpen && (
              <ViewDetails
                open={movieModalOpen}
                onOpenChange={() => setMovieModalOpen(false)}
                videoId={selectedMovieId}
              />
            )}

            {selectedSeries && (
              <SeriesModal
                series={selectedSeries}
                isOpen={Boolean(selectedSeries)}
                onClose={() => setSelectedSeries(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchContainer;
