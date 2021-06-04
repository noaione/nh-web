import React from "react";

export default function HeaderPrefetch() {
    return (
        <>
            {/* Preconnect and DNS-Prefetch */}
            <link rel="preconnect" href="https://api.ihateani.me" />
            <link rel="dns-prefetch" href="https://api.ihateani.me" />
        </>
    );
}
