/**
 * Based on:
 * https://github.com/danalloway/react-country-flag/blob/master/src/index.js
 */

import React from "react";
import PropTypes from "prop-types";

const DEFAULT_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/";
const DEFAULT_CDN_SUFFX = "svg";

const OFFSET = 127397;

interface FlagProps {
    countryCode: string;
    style?: React.CSSProperties;
    svg?: boolean;
}

type PropsElem = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> &
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

function CountryFlag(props: FlagProps & PropsElem) {
    const { countryCode, style, svg, ...rest } = props;

    if (typeof countryCode !== "string") {
        return null;
    }

    if (svg) {
        const flagUrl = `${DEFAULT_CDN_URL}${countryCode.toLowerCase()}.${DEFAULT_CDN_SUFFX}`;

        return (
            <img
                {...rest}
                src={flagUrl}
                style={{
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                    verticalAlign: "middle",
                    ...style,
                }}
            />
        );
    }

    const emoji = countryCode
        .toUpperCase()
        .replace(/./g, (chr) => String.fromCodePoint(chr.charCodeAt(0) + OFFSET));

    return (
        <span
            role="img"
            {...rest}
            style={{
                display: "inline-block",
                fontSize: "1em",
                lineHeight: "1em",
                verticalAlign: "middle",
                ...style,
            }}
        >
            {emoji}
        </span>
    );
}

CountryFlag.propTypes = {
    countryCode: PropTypes.string.isRequired,
    style: PropTypes.object,
    svg: PropTypes.bool,
};

export default CountryFlag;
