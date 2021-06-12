import React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";

import { InlineJs } from "@kachkaev/react-inline-js";

const THEME_CHECKER_JS = `
// Helper
const isNullified = function(data) {
    return typeof data === "undefined" || data === null;
}

// Check for first user preferences.
let userPreferDark;
let systemPreferDark = false;
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    systemPreferDark = true;
}
try {
    const themeStorage = localStorage.getItem("theme");
    if (!isNullified(themeStorage)) {
        userPreferDark = themeStorage === "dark" ? true : false;
    }
} catch (e) {};
if (isNullified(userPreferDark)) {
    if (systemPreferDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
} else {
    if (userPreferDark) {
        document.documentElement.classList.add("dark");
    }
}

// Theme toggler
const toggleTheme = function() {
    try {
        const isDark = document.documentElement.classList.contains("dark");
        isDark ? document.documentElement.classList.remove("dark") : document.documentElement.classList.add("dark");
        localStorage.setItem("theme", isDark ? "light" : "dark");
    } catch (e) {};
};
`;

class NHPagesDocumentContext extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
                    <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
                    <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
                    <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
                    <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
                    <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
                    <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
                    <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
                    <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="icon" type="image/png" href="/favicon.png" />
                    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                    <link rel="icon" href="/favicon.ico" />
                    <link rel="manifest" href="/manifest.json" />
                    <meta name="msapplication-TileColor" content="#B31437" />
                    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
                    <meta name="theme-color" content="#B31437" />
                    <InlineJs code={THEME_CHECKER_JS} />
                    <script defer async data-domain="nh.ihateani.me" src="/js/kryptonite.js" />
                </Head>
                <body className="bg-gray-800 text-white">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default NHPagesDocumentContext;
