import { useState, useCallback } from "react";
import { hyakuninIsshuData } from "../data/poemData";
import type { Poem } from "../types/types";

export function useSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Poem[]>([]);
    const [showResults, setShowResults] = useState(false);

    const executeSearch = useCallback((): Poem[] => {
        const kw = searchQuery.trim().toLowerCase();
        
        if (!kw) {
            setSearchResults([]);
            return [];
        }

        const results = hyakuninIsshuData.filter(
            (p) =>
                p.id.toString() === kw ||
                p.text.includes(kw) ||
                p.author?.includes(kw) ||
                p.historicalKana.includes(kw) ||
                p.modernKana.includes(kw)
        );

        setSearchResults(results);
        return results;
    }, [searchQuery]);

    const clearSearch = useCallback(() => {
        setShowResults(false);
        setSearchQuery("");
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        showResults,
        setShowResults,
        executeSearch,
        clearSearch,
    };
}