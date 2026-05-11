import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { hyakuninIsshuData } from "./data/poemData";
import type { Poem, AppState } from "./types/types";

import { useHistory } from "./hooks/useHistory";
import { useTimers } from "./hooks/useTimers";
import { useAudio } from "./hooks/useAudio";
import { useSearch } from "./hooks/useSearch";

import { SearchForm } from "./components/SearchForm";
import { SelectionPanel } from "./components/SelectionPanel";
import { PoemDisplay } from "./components/PoemDisplay";
import { TranslationArea } from "./components/TranslationArea";
import { HistorySection } from "./components/HistorySection";
import "./App.css";

const ROULETTE_TICKS = 15;
const ROULETTE_INTERVAL_MS = 60;
const COUNTDOWN_START = 3;
const AUTO_NEXT_DELAY_MS = 7000;

const App: React.FC = () => {
    const [state, setState] = useState<AppState>("idle");
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [currentPoem, setCurrentPoem] = useState<Poem | null>(null);
    const [displayedPhrases, setDisplayedPhrases] = useState<string[]>([]);
    const [showAuthor, setShowAuthor] = useState(false);
    const [rouletteNum, setRouletteNum] = useState("？");
    const [countdown, setCountdown] = useState<number | null>(null);
    const [bgId, setBgId] = useState<string>("default");

    const { history, addToHistory, clearHistory } = useHistory();
    const { addTimeout, addInterval, clearAll: clearAllTimers } = useTimers();
    const { playSync, stop: stopAudio } = useAudio();
    const search = useSearch();

    const stateRef = useRef<AppState>("idle");
    const isAutoModeRef = useRef(false);
    const startRouletteRef = useRef<(targetPoem?: Poem) => void>(() => { });
    const remainingIdsRef = useRef<number[]>(
        hyakuninIsshuData.map((p) => Number(p.id)),
    );

    useEffect(() => {
        stateRef.current = state;
    }, [state]);
    useEffect(() => {
        isAutoModeRef.current = isAutoMode;
    }, [isAutoMode]);

    const bgUrl = useMemo(() => {
        return `/images/${bgId}.JPG`;
        }, [bgId]);

    const delay = useCallback(
        (ms: number) =>
            new Promise((res) => {
                const id = window.setTimeout(res, ms);
                addTimeout(id);
            }),
        [addTimeout],
    );

    const stopAllRef = useRef<() => void>(() => {});

    const stopAll = useCallback(() => {
        setState("idle");
        clearAllTimers();
        stopAudio();
        setCountdown(null);
        setShowAuthor(false);
    }, [clearAllTimers, stopAudio]);

    useEffect(() => {
        stopAllRef.current = stopAll;
    }, [stopAll]);

    const playPoem = useCallback(
        async (poem: Poem, onComplete?: () => void) => {
            setState("playing");
            setCurrentPoem(poem);
            setBgId(poem.id.toString());
            addToHistory(poem);
            setRouletteNum("");
            setDisplayedPhrases([]);
            setShowAuthor(false);

            const phrases = poem.text.split(" ");
            const AUTHOR_REVEAL_INDEX = 4;

            for (let i = 0; i < phrases.length; i++) {
                if ((stateRef.current as AppState) === "idle") return;

                if (i === AUTHOR_REVEAL_INDEX) setShowAuthor(true);

                setDisplayedPhrases((prev) => [...prev, phrases[i]]);
                await playSync(`/audio/${poem.id}_${i}.mp3`);
               if (i < phrases.length - 1) {
                    await delay(i === 2 ? 2000 : 800);
                }
            }

            if ((stateRef.current as AppState) === "idle") return;
            setShowAuthor(true);

            if (onComplete) {
                await delay(AUTO_NEXT_DELAY_MS);
                if ((stateRef.current as AppState) !== "idle") {
                    onComplete();
                }
            } else {
                await delay(AUTO_NEXT_DELAY_MS);
                if ((stateRef.current as AppState) !== "idle") {
                    stopAllRef.current();
                }
            }
        },
        [addToHistory, playSync, delay],
    );

    const startCountdown = useCallback(
        (poem: Poem, onComplete?: () => void) => {
            setState("countdown");
            let count = COUNTDOWN_START;
            setCountdown(count);

            const timerId = window.setInterval(() => {
                count--;
                if (count > 0) {
                    setCountdown(count);
                } else {
                    window.clearInterval(timerId);
                    setCountdown(null);
                    if ((stateRef.current as AppState) !== "idle") {
                        playPoem(poem, onComplete);
                    }
                }
            }, 1000);
            addInterval(timerId);
        },
        [addInterval, playPoem],
    );

    const startRoulette = useCallback(
            (targetPoem?: Poem) => {
                stopAll();
                setState("roulette");
                setDisplayedPhrases([]);
                setShowAuthor(false);
    
                let ticks = 0;
                const timerId = window.setInterval(() => {
                    setRouletteNum(String(Math.floor(Math.random() * 100) + 1));
                    ticks++;
    
                    if (ticks > ROULETTE_TICKS) {
                        window.clearInterval(timerId);
    
                        if ((stateRef.current as AppState) !== "roulette") return;
    
                        const getNextPoem = () => {
                            if (targetPoem) return targetPoem;
    
                            if (remainingIdsRef.current.length === 0) {
                                window.alert("全百首の読み上げが終了しました！履歴をリセットして初期画面に戻ります。");
                                
                                clearHistory();
                                
                                stopAll(); 
                                
                                setCurrentPoem(null);
                                setRouletteNum("？");
                                setIsAutoMode(false);
                                
                                remainingIdsRef.current = hyakuninIsshuData.map((p) => Number(p.id));
                                
                                return null;
                            }
    
                            const pool = remainingIdsRef.current;
                            const idx = Math.floor(Math.random() * pool.length);
                            const selectedId = pool[idx];
    
                            remainingIdsRef.current = pool.filter(
                                (id) => id !== selectedId,
                            );
    
                            return hyakuninIsshuData.find(
                                (p) => Number(p.id) === selectedId,
                            )!;
                        };
    
                        const chosenPoem = getNextPoem();
                        
                        if (!chosenPoem) return;
    
                        setRouletteNum(String(chosenPoem.id));
    
                        const onComplete = isAutoModeRef.current
                            ? () => {
                                  startRouletteRef.current();
                              }
                            : undefined;
    
                        startCountdown(chosenPoem, onComplete);
                    }
                }, ROULETTE_INTERVAL_MS);
                addInterval(timerId);
            },
            [addInterval, stopAll, startCountdown, clearHistory],
        );

    useEffect(() => {
        startRouletteRef.current = startRoulette;
    }, [startRoulette]);

    const handleMainAction = () => {
        if (state !== "idle") {
            stopAll();
            setIsAutoMode(false);
        } else {
            const dummyAudio = new Audio();
            dummyAudio.play().catch(() => {});

            // 全首読み終えて止まっていた場合はリセットして再開
            if (remainingIdsRef.current.length === 0) {
                window.alert("全首読みが終了しました。再度スタートします。");
                remainingIdsRef.current = hyakuninIsshuData.map((p) => Number(p.id));
            }

            startRoulette();
        }
    };

    const handleSelectPoem = useCallback(
        (poem: Poem) => {
            stopAll();
            search.clearSearch();
            startRoulette(poem);
        },
        [stopAll, search, startRoulette],
    );

    const handleSearch = useCallback(() => {
        const results = search.executeSearch();

        if (results.length === 1) {
            // 1件なら直接再生
            search.setShowResults(false);
            handleSelectPoem(results[0]);
        } else {
            // 0件または2件以上ならパネル表示
            search.setShowResults(true);
        }
    }, [search, handleSelectPoem]);

    return (
        <div id="app">
            <div id="bg-blur" style={{ backgroundImage: `url("${bgUrl}")` }} />
            <div id="bg-clear" style={{ backgroundImage: `url("${bgUrl}")` }} />

            <header>
                <h1>
                    <span className="icon">🐦‍⬛</span>百人一首を覚えよう
                    <span className="icon">🦃</span>
                </h1>
            </header>

            <SearchForm
                query={search.searchQuery}
                onQueryChange={search.setSearchQuery}
                onSearch={handleSearch}
                state={state}
            />

            {search.showResults && (
                <SelectionPanel
                    results={search.searchResults}
                    onSelect={handleSelectPoem}
                    onClose={() => search.setShowResults(false)}
                />
            )}

            <main>
                <div
                    id="mobileImageArea"
                    style={{ backgroundImage: `url("${bgUrl}")` }}
                />
                <div id="roulette">{rouletteNum}</div>
                <div id="poem">
                    <PoemDisplay
                        state={state}
                        countdown={countdown}
                        displayedPhrases={displayedPhrases}
                        showAuthor={showAuthor}
                        currentPoem={currentPoem}
                    />
                </div>
                {currentPoem && (
                    <TranslationArea
                        poem={currentPoem}
                        visible={state === "playing" && showAuthor} />
                )}
            </main>

            <div className="controls">
                <button
                    id="mainBtn"
                    onClick={handleMainAction}
                    className={
                        isAutoMode && state !== "idle"
                            ? "btn-stop"
                            : "btn-start"
                    }
                >
                    {isAutoMode && state !== "idle"
                        ? "停止する"
                        : "ルーレット開始！"}
                    <br />

                    <label>
                        <input
                            type="checkbox"
                            checked={isAutoMode}
                            disabled={state !== "idle"}
                            onChange={(e) => setIsAutoMode(e.target.checked)}
                        />
                        自動モード
                    </label>
                </button>
            </div>

            

            <div id="stars" />

            <div className="narrator">音声：VOICEVOX:ずんだもん</div>

            
                <HistorySection
                    history={history}
                    onSelect={handleSelectPoem}
                    onClear={clearHistory}
                />
            
        </div>
    );
};

export default App;