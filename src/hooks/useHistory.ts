import { useState, useCallback } from "react";
import type { Poem } from "../types/types";
import { SETTINGS } from "../constants";

function isPoem(obj: unknown): obj is Poem {
    if (typeof obj !== "object" || obj === null) return false;
    const o = obj as Record<string, unknown>;
    return (
        typeof o.id === "number" &&
        typeof o.text === "string" &&
        typeof o.historicalKana === "string" &&
        typeof o.modernKana === "string" &&
        typeof o.reading === "string" &&
        typeof o.author === "string" &&
        typeof o.translation === "string"
    );
}

export function useHistory() {
    const [history, setHistory] = useState<Poem[]>(() => {
        try {
            const saved = localStorage.getItem(SETTINGS.HISTORY.KEY);
            if (!saved) return [];
            const parsed: unknown = JSON.parse(saved);
            
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
                -SETTINGS.HISTORY.MAX,
            );
            localStorage.setItem(SETTINGS.HISTORY.KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(SETTINGS.HISTORY.KEY);
    }, []);

    return { history, addToHistory, clearHistory };
}
