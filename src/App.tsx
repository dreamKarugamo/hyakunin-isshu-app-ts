import React, { useState, useMemo, useCallback } from "react";
// 型のインポート
import type { Poem } from "./types/types";
// カスタムフックのインポート
import { useHistory } from "./hooks/useHistory";
import { useTimers } from "./hooks/useTimers";
import { useAudio } from "./hooks/useAudio";
import { useSearch } from "./hooks/useSearch";
import { useGameLoop } from "./hooks/useGameLoop";
// コンポーネントのインポート
import { SearchForm } from "./components/SearchForm";
import { SelectionPanel } from "./components/SelectionPanel";
import { PoemDisplay } from "./components/PoemDisplay";
import { TranslationArea } from "./components/TranslationArea";
import { HistorySection } from "./components/HistorySection";
import { BackgroundImages } from "./components/BackgroundImages";
import "./App.css";

const App: React.FC = () => {
    const [isAutoMode, setIsAutoMode] = useState(false);

    // Hooks
    const { history, addToHistory, clearHistory } = useHistory();
    const { addTimer, clearAll: clearAllTimers } = useTimers();
    const { playSync, stop: stopAudio } = useAudio();
    const search = useSearch();

    // Core Logic Hook
    const {
        state,
        currentPoem,
        setCurrentPoem,
        displayedPoem,
        showAuthor,
        rouletteNum,
        countdown,
        startRoulette,
        stopAll,
    } = useGameLoop(
        playSync,
        addToHistory,
        stopAudio,
        addTimer,
        clearAllTimers,
    );

    const bgUrl = useMemo(
        () =>
            currentPoem
                ? `/images/${currentPoem.id}.JPG`
                : `/images/default.JPG`,
        [currentPoem],
    );

    const handleMainAction = useCallback(() => {
        if (state !== "idle") {
            stopAll();
            setIsAutoMode(false);
            setCurrentPoem(null);
        } else {
            startRoulette(undefined, isAutoMode);
        }
    }, [state, stopAll, startRoulette, isAutoMode]);

    const handleSelectPoem = useCallback(
        (poem: Poem) => {
            search.clearSearch();
            startRoulette(poem, isAutoMode);
        },
        [search, startRoulette, isAutoMode],
    );

    return (
        <div id="app">
            <BackgroundImages bgUrl={bgUrl} />

            <header>
                <h1>
                    <span className="icon">🐦‍⬛</span> 百人一首を覚えよう！{" "}
                    <span className="icon">🦃</span>
                </h1>
            </header>

            <SearchForm
                query={search.searchQuery}
                onQueryChange={search.setSearchQuery}
                onSearch={() => {
                    const results = search.executeSearch();
                    if (results.length === 1) {
                        // 1件だけならそのまま再生
                        handleSelectPoem(results[0]);
                    } else if (results.length > 1) {
                        // 複数件なら選択パネルを表示
                        search.setShowResults(true);
                    }
                }}
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
                        displayedPoem={displayedPoem}
                        showAuthor={showAuthor}
                        currentPoem={currentPoem}
                    />
                </div>
                <TranslationArea poem={currentPoem} visible={showAuthor} />
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
                    <label onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={isAutoMode}
                            disabled={state !== "idle"}
                            onChange={(e) => {
                                e.stopPropagation();
                                const checked = e.target.checked;
                                setIsAutoMode(checked);
                                if (checked && state === "idle") {
                                    startRoulette(undefined, true);
                                } else if (!checked && state !== "idle") {
                                    stopAll();
                                }
                            }}
                        />
                        自動モード
                    </label>
                </button>
            </div>

            <div className="narrator">音声：VOICEVOX: ずんだもん</div>

            {(state === "idle" || showAuthor) && (
                <HistorySection
                    history={history}
                    onSelect={handleSelectPoem}
                    onClear={clearHistory}
                />
            )}
            <div id="stars" />
        </div>
    );
};

export default App;
