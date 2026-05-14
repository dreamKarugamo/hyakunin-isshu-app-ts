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

    const { history, addToHistory, clearHistory } = useHistory();
    const { addTimer, clearAll: clearAllTimers } = useTimers();
    const { playSync, stop: stopAudio } = useAudio();
    const search = useSearch();

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
        history, // 既読チェックのために履歴を渡す
    );

    // 背景画像の制御
    const bgUrl = useMemo(
        () =>
            currentPoem
                ? `/images/${currentPoem.id}.JPG`
                : `/images/default.JPG`,
        [currentPoem],
    );

    // メインボタン（開始・停止）の制御
    const handleMainAction = useCallback(() => {
        if (state !== "idle" && state !== "finished") {
            stopAll();
            setIsAutoMode(false);
            setCurrentPoem(null);
        } else if (state === "idle") {
            startRoulette(undefined, isAutoMode);
        }
    }, [state, stopAll, startRoulette, isAutoMode, setCurrentPoem]);

    // 特定の歌を選択して開始
    const handleSelectPoem = useCallback(
        (poem: Poem) => {
            search.clearSearch();
            startRoulette(poem, isAutoMode);
        },
        [search, startRoulette, isAutoMode],
    );

    // 全件終了後のリセット処理
    const handleReset = useCallback(() => {
        clearHistory();
        stopAll();
        setIsAutoMode(false);
    }, [clearHistory, stopAll]);

    return (
        <div id="app">
            <BackgroundImages bgUrl={bgUrl} isCountdown={state === "countdown"} />

            <header>
                <h1>
                    <span className="icon">🐦‍⬛</span> 百人一首を覚えよう！{" "}
                    <span className="icon">🦃</span>
                </h1>
            </header>

            {/* 完了画面（Congratulations）のオーバーレイ */}
            {state === "finished" && (
                <div className="congrats-overlay">
                    <div className="congrats-content">
                        <h2>🎉 Congratulations! 🎉</h2>
                        <p>全100首をすべて読み終えました！</p>
                        <button onClick={handleReset} className="reset-btn">
                            最初からやり直す
                        </button>
                    </div>
                </div>
            )}

            <SearchForm
                query={search.searchQuery}
                onQueryChange={search.setSearchQuery}
                onSearch={() => {
                    const results = search.executeSearch();
                    if (results.length === 1) {
                        handleSelectPoem(results[0]);
                    } else if (results.length > 1) {
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
                <div className="main-container">
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

                </div>

                <div className="controls">
                    <button
                        id="mainBtn"
                        onClick={handleMainAction}
                        disabled={state === "finished"}
                        className={
                            isAutoMode && state !== "idle" && state !== "finished"
                                ? "btn-stop"
                                : "btn-start"
                        }
                    >
                        {isAutoMode && state !== "idle" && state !== "finished"
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
            </main>

            <div id="stars" />
            
            <footer>
                <HistorySection
                    history={history}
                    onSelect={handleSelectPoem}
                    onClear={clearHistory}
                />
                <div className="narrator">音声：VOICEVOX: ずんだもん</div>
            </footer>
        </div>
    );
};

export default App;