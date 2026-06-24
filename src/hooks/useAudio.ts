import { useRef, useCallback, useEffect } from "react";
import { SETTINGS } from "../constants";

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const safetyTimerRef = useRef<number | null>(null); // 追加

    if (audioRef.current === null) {
        audioRef.current = new Audio();
    }

    // アンマウント時にaudioとsafetyTimer を cleanup
    useEffect(() => {
        return () => {
            if (safetyTimerRef.current !== null) {
                window.clearTimeout(safetyTimerRef.current);
            }
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                audio.onended = null;
                audio.onerror = null;
            }
        };
    }, []);

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

            // 前回の safetyTimer が残っていればキャンセル
            if (safetyTimerRef.current !== null) {
                window.clearTimeout(safetyTimerRef.current);
                safetyTimerRef.current = null;
            }

            audio.pause();
            audio.src = src;
            audio.load();
            audio.playbackRate = 0.9;

            safetyTimerRef.current = window.setTimeout(() => {
                console.warn("Audio Timeout:", src);
                safetyTimerRef.current = null;
                resolve();
            }, SETTINGS.AUDIO.SAFETY_TIMEOUT_MS);

            audio.onended = () => {
                if (safetyTimerRef.current !== null) {
                    window.clearTimeout(safetyTimerRef.current);
                    safetyTimerRef.current = null;
                }
                resolve();
            };

            audio.onerror = (err) => {
                console.error("Audio Error:", err);
                if (safetyTimerRef.current !== null) {
                    window.clearTimeout(safetyTimerRef.current);
                    safetyTimerRef.current = null;
                }
                resolve();
            };

            audio.play().catch((err) => {
                console.error("Play Blocked:", err);
                if (safetyTimerRef.current !== null) {
                    window.clearTimeout(safetyTimerRef.current);
                    safetyTimerRef.current = null;
                }
                resolve();
            });
        });
    }, []);

    return { playSync, stop };
}