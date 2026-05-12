import React from 'react';

export const BackgroundImages: React.FC<{ bgUrl: string }> = ({ bgUrl }) => (
    <>
        <div id="bg-blur" style={{ backgroundImage: `url("${bgUrl}")` }}></div>
        <div id="bg-clear" style={{ backgroundImage: `url("${bgUrl}")` }}></div>
    </>
);
