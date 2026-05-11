import { useCallback, useRef } from "react";

// 音声ファイルが読み込めない場合
const AUDIO_SAFETY_TIMEOUT_MS = 3000;

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    }, []);

    const playSync = useCallback(
        (src: string): Promise<void> => {
            return new Promise((resolve) => {
                stop();
                const audio = new Audio(src);
                audio.playbackRate = 0.9;
                audioRef.current = audio;

                const safetyTimer = window.setTimeout(
                    resolve,
                    AUDIO_SAFETY_TIMEOUT_MS,
                );

                audio.onended = () => {
                    window.clearTimeout(safetyTimer);
                    resolve();
                };

                audio.onerror = () => {
                    window.clearTimeout(safetyTimer);
                    resolve();
                };

                audio.play().catch(() => {
                    window.clearTimeout(safetyTimer);
                    resolve();
                });
            });
        },
        [stop],
    );

    return { playSync, stop };
}