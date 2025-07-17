import { Search } from "lucide-react";
import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  theme,
}) => {
  return (
    <div className="relative w-full max-w-md">

      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          className={`h-4 w-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        />
      </div>

      
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full pl-10 p-2 border rounded focus:outline-none focus:ring-1 ${
          theme === "dark"
            ? "bg-gray-800 text-white border-gray-700 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-600"
            : "bg-white border-gray-300 placeholder-gray-500 focus:border-gray-400 focus:ring-gray-300"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;