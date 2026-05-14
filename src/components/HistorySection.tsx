import React, { useState } from "react";
import type { Poem } from "../types/types";
import { SETTINGS } from "../constants";

interface HistorySectionProps {
    history: Poem[];
    onSelect: (p: Poem) => void;
    onClear: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
    history,
    onSelect,
    onClear,
}) => {
    const [confirming, setConfirming] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleClearClick = () => {
        setConfirming(true);
    };

    const handleConfirm = () => {
        onClear();
        setConfirming(false);
    };

    const handleCancel = () => {
        setConfirming(false);
    };

    return (
        <section id="history">
            <button
                type="button"
                className="history-toggle"
                onClick={() => setIsOpen((v) => !v)}
            >
                <span className="history-toggle-count">
                    進捗率： {history.length} / {SETTINGS.POEM.HYAKUNIN_ISSHU_LENGTH}
                </span>
                <span className="history-toggle-arrow">
                    {isOpen ? "▲" : "▼"}
                </span>
            </button>

            {isOpen && (
                <>
                    <p className="history-toggle-label">最近読んだ五首</p>

                    <ul id="historyList">
                        {history.length > 0 ? (
                            [...history]
                                .slice(-SETTINGS.HISTORY.DISPLAY)
                                .reverse()
                                .map((p) => (
                                    <li
                                        key={p.id}
                                        className="history-item"
                                        onClick={() => onSelect(p)}
                                    >
                                        #{p.id} / {p.author} /<br />
                                        {p.text}
                                    </li>
                                ))
                        ) : (
                            <p className="empty-history">
                                まだ履歴がありません
                            </p>
                        )}
                    </ul>

                    {history.length > 0 &&
                        (confirming ? (
                            <div className="clear-confirm">
                                <span className="clear-confirm-msg">
                                    本当に削除しますか？
                            </span>

                                <div className="clear-confirm-button-group">
                                    <button
                                        type="button"
                                        className="clear-confirm-yes"
                                        onClick={handleConfirm}
                                    >
                                        削除する
                                    </button>
                                    <button
                                        type="button"
                                        className="clear-confirm-no"
                                        onClick={handleCancel}
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <span
                                onClick={handleClearClick}
                                className="reset-char"
                            >
                                履歴を消去する
                            </span>
                        ))}
                </>
            )}
        </section>
    );
};
