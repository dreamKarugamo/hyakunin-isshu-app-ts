import { useState, useCallback } from "react";
import type { Poem } from "../types/types";

const HISTORY_KEY = "isshuHistory";
const HISTORY_MAX = 101;

// unknownとして型ガード
function isPoem(obj: unknown): obj is Poem {
    if (typeof obj !== "object" || obj === null) return false;
    const o = obj as Record<string, unknown>;
    return (
        typeof o.id === "number" &&
        typeof o.text === "string" &&
        typeof o.author === "string" &&
        typeof o.translation === "string" &&
        typeof o.historicalKana === "string" &&
        typeof o.modernKana === "string" &&
        typeof o.reading === "string"
    );
}

export function useHistory() {
    const [history, setHistory] = useState<Poem[]>(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (!saved) return [];
            const parsed: unknown = JSON.parse(saved);
            
            // 配列かつ各要素が Poem の形か確認
            if (Array.isArray(parsed)) {
                return parsed.filter(isPoem);
            }
            return [];
        } catch {
            return [];
        }
    });

    const addToHistory = useCallback((poem: Poem) => {
        setHistory((prev) => {
            const next = [...prev.filter((p) => p.id !== poem.id), poem].slice(
                -HISTORY_MAX,
            );
            localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    }, []);

    return { history, addToHistory, clearHistory };
}
