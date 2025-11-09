"use client";

import ViewDetails from "@/app/_components/view-details";
import { useSocket } from "@/components/provider/SocketProvider";
import { ApiResponse, Movie, Series } from "@/types/search-data-type";
import { Search, X } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";

const SearchContainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  console.log(movies, "movies");
  console.log(series, "series");

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
            {/* movies  */}
            <div className="p-6 w-full">
              {movies?.length > 0 ? (
                <>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white leading-[120%] text-center pb-6">
                    Movies List
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                      <div
                        key={movie._id}
                        onClick={() => {
                          setIsOpen(true);
                          setSelectedVideoId(movie._id);
                        }}
                        className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer bg-gray-900"
                      >
                        <div
                          className="h-[300px] bg-cover bg-center transition-transform hover:scale-105 duration-300"
                          style={{
                            backgroundImage: `url(${movie.thumbnailUrl})`,
                          }}
                        ></div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white text-center">
                            {movie.title}
                          </h3>
                          <p className="text-sm text-gray-400 text-center mt-1">
                            {movie.genre?.[0]?.title ?? "No Genre"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] w-full flex items-center justify-center">
                  <p className="text-white text-2xl md:text-3xl lg:text-4xl text-center">
                    No Movie found.
                  </p>
                </div>
              )}
            </div>
            {/* series  */}
            <div className="p-6 w-full">
              {series?.length > 0 ? (
                <>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white leading-[120%] text-center pb-8">
                    Series List
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {series?.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => {
                          setIsOpen(true);
                          setSelectedVideoId(s?._id);
                        }}
                        className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer bg-gray-900"
                      >
                        <div
                          className="h-[300px] bg-cover bg-center transition-transform hover:scale-105 duration-300"
                          style={{
                            backgroundImage: `url(${s?.thumbnailUrl })`,
                          }}
                        ></div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white text-center">
                            {s?.title}
                          </h3>
                          <p className="text-sm text-gray-400 text-center mt-1">
                            {s?.genre?.[0]?.title ?? "No Genre"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] w-full flex items-center justify-center">
                  <p className="text-white text-2xl md:text-3xl lg:text-4xl text-center">
                    No Series movie found.
                  </p>
                </div>
              )}
            </div>

            {/* modal open  */}
            {isOpen && (
              <div>
                <ViewDetails
                  open={isOpen}
                  onOpenChange={() => setIsOpen(false)}
                  videoId={selectedVideoId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchContainer;
