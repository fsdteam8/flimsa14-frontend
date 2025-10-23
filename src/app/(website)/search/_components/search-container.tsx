


"use client";

import { useSocket } from "@/components/provider/SocketProvider";
import { ApiResponse, Movie, Series } from "@/types/search-data-type";
import { Search, X } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";

const SearchContainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
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
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setMovies([]);
    setSeries([]);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Search Box */}
      <div className="w-full flex justify-center bg-black/40 backdrop-blur-[10px] p-6">
        <div className="w-2/3 flex flex-col items-center bg-gray-800 rounded-lg p-3 shadow-md relative">
          <div className="flex items-center w-full">
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
              {/* {series.map((s) => (
                <li
                  key={s._id}
                  className="text-white p-2 hover:bg-gray-600 rounded cursor-pointer"
                >
                  {s.title} (Series)
                </li>
              ))} */}
            </ul>
          )}
        </div>
      </div>

      {/* Detailed cards */}
      <div className="w-2/3 mt-4 grid grid-cols-1 gap-4">
        {movies.map((m) => (
          <div
            key={m._id}
            className="bg-gray-800 p-4 rounded-md shadow hover:bg-gray-700 transition cursor-pointer"
          >
            <p className="text-white font-semibold">{m.title}</p>
            <p className="text-gray-300 text-sm">{m.description}</p>
          </div>
        ))}

        {/* {series.map((s) => (
          <div
            key={s._id}
            className="bg-gray-800 p-4 rounded-md shadow hover:bg-gray-700 transition cursor-pointer"
          >
            <p className="text-white font-semibold">{s.title}</p>
            <p className="text-gray-300 text-sm">{s.description}</p>
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default SearchContainer;


