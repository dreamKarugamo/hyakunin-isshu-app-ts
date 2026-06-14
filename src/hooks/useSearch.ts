import { useState, useCallback } from 'react';
import { hyakuninIsshuData } from '../data/poemData';
import type { Poem } from '../types/types';

//カタカナをひらがなに変換する（U+30A1–U+30F6 → U+3041–U+3096）
function kataToHira(s: string): string {
    return s.replace(/[\u30A1-\u30F6]/g, (c) =>
        String.fromCharCode(c.charCodeAt(0) - 0x60)
    );
}

export function useSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Poem[]>([]);
    const [showResults, setShowResults] = useState(false);

    const executeSearch = useCallback((): Poem[] => {
        const normalized = searchQuery
            .trim()
            .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)); // 全角から半角に変換
        const kw = normalized.toLocaleLowerCase();

        if (!kw) {
            setSearchResults([]);
            setShowResults(false);
            return [];
        }

        const kwHira = kataToHira(kw);

        const results = hyakuninIsshuData.filter((p) => {
            const numKw = Number(kw);
            const isNum = !isNaN(numKw) && kw !== "";  // 有効な数値かチェック

            return (
                (isNum && p.id === numKw) ||  // 数値のときだけ id 比較
                p.text.includes(kw) ||
                p.author?.includes(kw) ||
                p.historicalKana.includes(kw) ||
                p.modernKana.includes(kw) ||
                p.historicalKana.includes(kwHira) ||
                p.modernKana.includes(kwHira)
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