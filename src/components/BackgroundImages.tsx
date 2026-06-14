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

    // bgUrl が変化したときにのみフェード処理を行う（単一のuseEffectに統合）
    useEffect(() => {
        if (bgUrl === prevUrlRef.current) return;

        const img = new Image();
        img.src = bgUrl;

        const performTransition = () => {
            if (showB) {
                // Layer B (現在表示中) から Layer A へフェード
                setLayerA(bgUrl);
                setTimeout(() => {
                    requestAnimationFrame(() => setShowB(false));
                }, 50);
            } else {
                // Layer A (現在表示中) から Layer B へフェード
                setLayerB(bgUrl);
                setTimeout(() => {
                    requestAnimationFrame(() => setShowB(true));
                }, 50);
            }
            prevUrlRef.current = bgUrl;
        };

        if (img.complete) {
            performTransition();
        } else {
            img.onload = performTransition;
        }
    }, [bgUrl, showB, isCountdown]);

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
