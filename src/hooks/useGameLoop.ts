// インポート
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Poem, AppState } from '../types/types';
import { hyakuninIsshuData } from '../data/poemData';
import { SETTINGS } from '../constants';

export const useGameLoop = (
    playSync: (url: string) => Promise<void>,
    addToHistory: (poem: Poem) => void,
    stopAudio: () => void,
    addTimer: (id: number) => void,
    clearTimers: () => void,
) => {
    // =======================================
    // 状態管理
    // =======================================

    // useState-------------------
    const [state, setState] = useState<AppState>('idle');
    const [currentPoem, setCurrentPoem] = useState<Poem | null>(null);
    const [displayedPoem, setDisplayedPoem] = useState<string[]>([]);
    const [rouletteNum, setRouletteNum] = useState<string>("？");
    const [showAuthor, setShowAuthor] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [remainingIds, setRemainingIds] =
        useState<number[]>(() =>
            hyakuninIsshuData.map((p) => Number(p.id)),
    );

    // Refs-------------------
    // 非同期クロージャー内での最新参照用
    const stateRef = useRef<AppState>(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // 循環参照回避用
    const startRouletteRef = useRef<(target?: Poem, isAuto?: boolean) => void>(() => { });

    // =======================================
    // アクション
    // =======================================

    // ストップ関数
    const stopAll = useCallback(() => {
        setState("idle");
        clearTimers();
        stopAudio();
        setCountdown(null);
        setShowAuthor(false);
    }, [clearTimers, stopAudio]);

    // プレイ関数
    const playPoem = useCallback(
        async (poem: Poem, isAuto: boolean) => {
            setState("playing");
            setCurrentPoem(poem);
            addToHistory(poem);
            setRouletteNum("");
            setDisplayedPoem([]);
            setShowAuthor(false);

            // 和歌をスペースで分割、タイミングに合わせて一句ずつ出す
            const phrases = poem.text.split(" ");
            for (let i = 0; i < phrases.length; i++) {
                if (stateRef.current === "idle") return false;

                // 四首目と同時に作者名表示
                if (i === SETTINGS.INDICES.AUTHOR_REVEAL) setShowAuthor(true);

                setDisplayedPoem((prev) => [...prev, phrases[i]]);
                await playSync(`audio/${poem.id}_${i}.mp3`);

                // フレーズ間の待機
                if (i < phrases.length - 1) {
                    const wait =
                        i === SETTINGS.INDICES.LONG_PAUSE // 2
                            ? SETTINGS.DELAYS.PHRASE_LONG // 2000
                            : SETTINGS.DELAYS.PHRASE_SHORT; // 800

                    await new Promise<void>((res) => {
                        const tid = window.setTimeout(res, wait);
                        addTimer(tid);
                    });
                }
            }

            if (stateRef.current === "idle") return false;
            setShowAuthor(true);

            if (isAuto) {
                await new Promise<void>((res) => {
                    const tid = window.setTimeout(
                        res,
                        SETTINGS.DELAYS.AUTO_NEXT, // 7000 現代語訳を読める時間のため長めにとる
                    );
                    addTimer(tid);
                });

                if (stateRef.current as AppState !== "idle") {
                    startRouletteRef.current(undefined, true);
                }
            } else {
                await new Promise<void>((res) => {
                        const tid = window.setTimeout(res, SETTINGS.DELAYS.AUTO_NEXT); // 既存の7000ms定数を流用
                        addTimer(tid);
                    });
                    if (stateRef.current as AppState !== "idle") {
                        stopAll();
                    }
            }
            return true;
        }, [playSync, addToHistory, addTimer, stopAll],
    );

    const startRoulette = useCallback(
        (targetPoem?: Poem, isAuto = false) => {
            stopAll();
            setState("spinning");
            setDisplayedPoem([]);
            setShowAuthor(false);

            let ticks = 0;
            const timerId = window.setInterval(async () => {
                setRouletteNum(
                    String(Math.floor(Math.random() * hyakuninIsshuData.length) + 1,
                    )
                );
                ticks++;

                if (ticks <= SETTINGS.ROULETTE.TICKS) return; // 60
                window.clearInterval(timerId);
                if (stateRef.current !== "spinning") return;

                // ここで表示する和歌を決定
                const chosen = targetPoem ||
                    (() => {
                        const pool = remainingIds.length > 0 ? remainingIds
                        : hyakuninIsshuData.map((p) => Number(p.id));

                        const id = pool[Math.floor(Math.random() * pool.length)];

                        setRemainingIds((prev) =>
                            prev.filter((pId) => pId !== id),
                        );

                        return hyakuninIsshuData.find(
                            (p) => Number(p.id) === id,
                        )!;
                    })();

                setRouletteNum(String(chosen.id));

                setState("countdown");
                for (let c = SETTINGS.COUNTDOWN.START; c > 0; c--) {
                    if (stateRef.current as AppState === "idle") return;
                    setCountdown(c);
                    await new Promise<void>((res) => {
                        const tid = window.setTimeout(
                            res,
                            SETTINGS.COUNTDOWN.INTERVAL_MS,
                        );
                        addTimer(tid);
                    });
                }
                setCountdown(null);
                // 再生開始
                if (stateRef.current as AppState !== "idle") {
                    await playPoem(chosen, isAuto);
                }
            }, SETTINGS.ROULETTE.INTERVAL_MS);
            addTimer(timerId);
        },
        [stopAll, remainingIds, playPoem, addTimer],
    );

    useEffect(() => {
        startRouletteRef.current = startRoulette;
    }, [startRoulette]);

    return {
        state,
        currentPoem,
        setCurrentPoem,
        displayedPoem,
        showAuthor,
        rouletteNum,
        countdown,
        startRoulette,
        stopAll,
    };
};
