import { useCallback, useRef } from 'react';

type TimerEntry = {
    id: number;
    type: "timeout" | "interval"
}

export function useTimers() {
    const timersRef = useRef<TimerEntry[]>([]);

    const addTimeout = useCallback((id: number) => {
        timersRef.current.push({ id, type: "timeout" });
    }, []);

    const addInterval = useCallback((id: number) => {
        timersRef.current.push({ id, type: "interval" });
    }, []);

    const clearAll = useCallback(() => {
        timersRef.current.forEach(({ id, type }) => {
            if (type === "timeout") {
                window.clearTimeout(id);
            } else {
                window.clearInterval(id);
            }
        });
        timersRef.current = [];
    }, []);

    return { addTimer: addTimeout, addInterval, clearAll };
}
