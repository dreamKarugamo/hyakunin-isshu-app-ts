import React from "react";
import type { Poem } from "../types/types";

interface SelectionPanelProps {
    results: Poem[];
    onSelect: (p: Poem) => void;
    onClose: () => void;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({
    results,
    onSelect,
    onClose,
}) => (
    <div className="selection-panel-overlay" onClick={onClose}>
        <div className="selection-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
                <h3>検索結果 ({results.length}件)</h3>
                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>
            </div>
            <div className="scroll-area">
                {results.length > 0 ? (
                    results.map((p) => (
                        <div
                            key={p.id}
                            className="poem-card"
                            onClick={() => onSelect(p)}
                        >
                            <div className="poem-card-id">{p.id}</div>
                            <div className="poem-card-content">
                                <span className="poem-card-text">{p.text} / </span>
                                <span className="poem-author">{p.author}</span>     
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-result">一致する歌が見つかりません</p>
                )}
            </div>
        </div>
    </div>
);
