import React from 'react';
import type { Poem } from '../types/types';

interface TranslationAreaProps {
    poem: Poem | null;
    visible: boolean;
}

export const TranslationArea: React.FC<TranslationAreaProps> = ({
    poem,
    visible,
}) => {
    if (!visible || !poem) return null;

    return (
        <div id="translationArea">
            <div className="translation-area">
                <p id="translationText">
                    <strong>
                        【現代語訳】
                    </strong>
                    {poem.translation}
                </p>
            </div>
        </div>
    );
};
