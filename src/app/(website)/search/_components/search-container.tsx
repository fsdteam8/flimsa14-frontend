"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const SearchContainer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // Debounce effect: updates debouncedTerm after 500ms of inactivity
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // For demo: log only the debounced value
  useEffect(() => {
    if (debouncedTerm) {
      console.log("Debounced search term:", debouncedTerm);
      // You can call API here using debouncedTerm
    }
  }, [debouncedTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="w-full flex justify-center bg-black/40 backdrop-blur-[10px] p-6">
      <div className="w-2/3 flex items-center bg-gray-800 rounded-lg p-3 shadow-md relative">
        <Search className="w-5 h-5 text-white mr-3" />
        <input
          type="text"
          placeholder="Search artists..."
          className="bg-transparent text-white placeholder-gray-400 outline-none w-full text-base focus:ring-0 transition duration-200"
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
    </div>
  );
};

export default SearchContainer;
 






























// "use client";

// import { Search, X } from "lucide-react";
// import { useState } from "react";

// const SearchContainer = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   console.log("Search term:", searchTerm); 
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const clearSearch = () => {
//     setSearchTerm("");
//   };

//   return (
//     <div className="w-full flex justify-center bg-black/40 backdrop-blur-[10px] p-6">
//       <div className="w-2/3 flex items-center bg-gray-800 rounded-lg p-3 shadow-md relative">
//         <Search className="w-5 h-5 text-white mr-3" />
//         <input
//           type="text"
//           placeholder="Search artists..."
//           className="bg-transparent text-white placeholder-gray-400 outline-none w-full text-base focus:ring-0 transition duration-200"
//           value={searchTerm}
//           onChange={handleSearch}
//         />
//         {searchTerm && (
//           <X
//             className="w-5 h-5 text-white cursor-pointer absolute right-3"
//             onClick={clearSearch}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchContainer;
