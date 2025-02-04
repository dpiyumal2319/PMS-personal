import React, { useState } from "react";

interface SearchBoxProps {
    onSearch: (query: string) => void; // Callback triggered on search
    placeholder?: string; // Optional placeholder text
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, placeholder = "Search patients..." }) => {
    const [inputValue, setInputValue] = useState(""); // Local state for input value

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent form reload
        onSearch(inputValue); // Trigger the search callback with the current input
    };

    return (
        <form onSubmit={handleFormSubmit} className="flex items-center max-w-lg mx-auto">
            <div className="relative w-full">
                <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={placeholder}
                    value={inputValue} // Controlled by local state
                    onChange={(e) => setInputValue(e.target.value)} // Update state on typing
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                    >
                        <path
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 19l-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
                        />
                    </svg>
                </div>
            </div>
            <button
                type="submit"
                className="ml-2 py-2 px-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBox;
