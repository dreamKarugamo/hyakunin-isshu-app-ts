import { useRef, useCallback } from "react";
import { SETTINGS } from "../constants";

export function useAudio() {
    // 遅延初期化（Strict Mode の二重実行で複数生成されるのを防ぐ）
    const audioRef = useRef<HTMLAudioElement | null>(null);
    if (audioRef.current === null) {
        audioRef.current = new Audio();
    }

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    }, []);

    const playSync = useCallback((src: string): Promise<void> => {
        return new Promise((resolve) => {
            const audio = audioRef.current;
            if (!audio) {
                resolve();
                return;
            }

            audio.pause();
            audio.src = src;
            audio.load();
            audio.playbackRate = 0.9;

            const safetyTimer = window.setTimeout(() => {
                console.warn("Audio timeout:", src);
                resolve();
            }, SETTINGS.AUDIO.SAFETY_TIMEOUT_MS); // 8000

            audio.onended = () => {
                window.clearTimeout(safetyTimer);
                resolve();
            };

            audio.onerror = (e) => {
                console.error("Audio error:", e);
                window.clearTimeout(safetyTimer);
                resolve();
            };

            audio.play().catch((err) => {
                console.error("Play blocked:", err);
                window.clearTimeout(safetyTimer);
                resolve();
            });
        });
    }, []);

    return { playSync, stop };
}
