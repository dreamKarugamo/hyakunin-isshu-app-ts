import React, { useState, useEffect, useRef } from "react";

interface BackgroundImagesProps {
    bgUrl: string;
    isCountdown: boolean;
}

export const BackgroundImages: React.FC<BackgroundImagesProps> = ({
    bgUrl,
    isCountdown,
}) => {
    const [layerA, setLayerA] = useState(bgUrl);
    const [layerB, setLayerB] = useState(bgUrl);
    const [showB, setShowB] = useState(false);

    const prevUrlRef = useRef(bgUrl);
    const prevCountdownRef = useRef(isCountdown);

    useEffect(() => {
        const urlChanged = bgUrl !== prevUrlRef.current;
        const countdownStarted = isCountdown && !prevCountdownRef.current;

        // カウントダウンがはじまりURLが変わったら、次の画像をプリロード
        if (countdownStarted && urlChanged) {
            const img = new Image();
            img.src = bgUrl;

            const startFade = () => {
                if (showB) {
                    // LayerAを表示
                    setLayerA(bgUrl);

                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            setShowB(false);
                        });
                    }, 100);
                } else {
                    // LayerBを表示
                    setLayerB(bgUrl);
                    
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            setShowB(true);
                        });
                    }, 100);
                }
                prevUrlRef.current = bgUrl;
            };

            if (img.complete) {
                // すでにキャッシュ済み
                startFade();
            } else {
                // 読み込み完了を待ってからフェード
                img.onload = startFade;
            }
        }

        prevCountdownRef.current = isCountdown;
    }, [bgUrl, isCountdown, showB]);

    useEffect(() => {
        if (bgUrl === prevUrlRef.current) return;
    
        const img = new Image();
        img.src = bgUrl;
    
        const performTransition = () => {
            if (showB) {
                setLayerA(bgUrl);
                // Layer B (現在1) から Layer A (現在0) へフェード
                setTimeout(() => setShowB(false), 50);
            } else {
                setLayerB(bgUrl);
                // Layer A (現在1) から Layer B (現在0) へフェード
                setTimeout(() => setShowB(true), 50);
            }
            prevUrlRef.current = bgUrl;
        };
    
        img.onload = performTransition;
        if (img.complete) performTransition();
    
    }, [bgUrl, showB]);

    const FADE_DURATION = "1200ms";

    const baseStyle: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        transition: `opacity ${FADE_DURATION} ease-in-out`,
    };

    // ぼかしレイヤー
    const blurStyle: React.CSSProperties = {
        ...baseStyle,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(20px) brightness(0.4)",
        transform: "scale(1.1)",
        zIndex: -2,
    };

    // クリアレイヤー
    const clearStyle: React.CSSProperties = {
        ...baseStyle,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        zIndex: -1,
    };

    return (
        <>
            {/* ブラーレイヤー A */}
            <div
                id="bg-blur-a"
                style={{
                    ...blurStyle,
                    backgroundImage: `url("${layerA}")`,
                    opacity: showB ? 0 : 1,
                }}
            />
            {/* ブラーレイヤー B */}
            <div
                id="bg-blur-b"
                style={{
                    ...blurStyle,
                    backgroundImage: `url("${layerB}")`,
                    opacity: showB ? 1 : 0,
                }}
            />
            {/* クリアレイヤー A */}
            <div
                id="bg-clear-a"
                style={{
                    ...clearStyle,
                    backgroundImage: `url("${layerA}")`,
                    opacity: showB ? 0 : 1,
                }}
            />
            {/* クリアレイヤー B */}
            <div
                id="bg-clear-b"
                style={{
                    ...clearStyle,
                    backgroundImage: `url("${layerB}")`,
                    opacity: showB ? 1 : 0,
                }}
            />
        </>
    );
};
