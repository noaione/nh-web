import React from "react";

import { nhTitle } from "../../lib/types";

export default function ReaderTitle(props: nhTitle) {
    const { simple, english, japanese } = props;

    const mainTitle = english || japanese;
    if (typeof mainTitle !== "string") {
        return <div className="text-xl font-bold">{simple}</div>;
    }

    const splitAtSimple = mainTitle.split(simple);
    if (splitAtSimple.length !== 2) {
        return <div className="text-xl font-bold">{mainTitle}</div>;
    }

    return (
        <div className="text-xl font-bold">
            <span className="text-gray-400" aria-label="Before Highlight">
                {splitAtSimple[0]}
            </span>
            <span className="text-white" aria-label="Highlight">
                {simple}
            </span>
            <span className="text-gray-400" aria-label="After Highlight">
                {splitAtSimple[1]}
            </span>
        </div>
    );
}
