import { useState, useCallback } from 'react';
import { hyakuninIsshuData } from '../data/poemData';
import type { Poem } from '../types/types';

export function useSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Poem[]>([]);
    const [showResults, setShowResults] = useState(false);

    const executeSearch = useCallback((): Poem[] => {
        const normalized = searchQuery
            .trim()
            .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)); // 全角→半角
        const kw = normalized.toLocaleLowerCase();

        if (!kw) {
            setSearchResults([]);
            setShowResults(false);
            return [];
        }

        const results = hyakuninIsshuData.filter((p) => {
            const numKw = Number(kw);
            const isNum = !isNaN(numKw) && kw !== "";  // 有効な数値かチェック
            
            return (
                (isNum && p.id === numKw) ||  // 数値のときだけ id 比較
                p.text.includes(kw) ||
                p.author?.includes(kw) ||
                p.historicalKana.includes(kw) ||
                p.modernKana.includes(kw)
            );
        });

        setSearchResults(results);
        setShowResults(true);
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