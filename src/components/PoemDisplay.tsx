import React from "react";
import type { Poem, AppState } from "../types/types";

interface PoemDisplayProps {
    state: AppState;
    countdown: number | null;
    displayedPhrases: string[];
    showAuthor: boolean;
    currentPoem: Poem | null;
}

// 和歌の表示
export const PoemDisplay: React.FC<PoemDisplayProps> = ({
    state,
    countdown,
    displayedPhrases,
    showAuthor,
    currentPoem,
}) => {
    // 待機中
    if (state === "idle") {
        return <span className="start-prompt">ボタンを押してね🐣️</span>;
    }

    // カウントダウン中
    if (state === "countdown") {
        return (
            <div>
                <span>読み上げまで...</span>
                <span className="countdown">{countdown}</span>
            </div>
        );
    }

    // 再生中
    if (state === "playing") {
        return (
            <div className="poem-text-container">
                {displayedPhrases.map((phrase, i) => (
                    <div key={i} className="phrase-line">
                        {phrase}
                    </div>
                ))}
                {showAuthor && (
                    <div className="author">{currentPoem?.author}</div>
                )}
            </div>
        );
    }

    return <div className="waiting-msg">次は何かな？</div>;
};
