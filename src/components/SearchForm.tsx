import React from "react";
import type { AppState } from "../types/types";

interface SearchFormProps {
    query: string;
    onQueryChange: (v: string) => void;
    onSearch: () => void;
    state?: AppState;
    className?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({ query, onQueryChange, onSearch, state }) => {
    return (
        <div className="search-box">
            <div className={`search-container ${state !== "idle" ? "hide-on-desktop" : ""}`}>
            <input
                className="input-box"
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="番号、歌、作者で探す..."
            />
            <button type="button" className="search-btn" onClick={onSearch}>
                検索
            </button>
            </div>
        </div>
    );
};