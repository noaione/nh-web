import Link from "next/link";
import React, { useRef, useState } from "react";
import LazyLoad from "react-lazyload";

import CountryFlag from "./CountryFlag";

import { nhInfoWebResult } from "../lib/types";

interface PropsExtends {
    doujinId: string;
    doujinTitle: string;
    doujinLang: string;
}

const THURL = /http[s]?:\/\/t(?:\d{1,2})?\.nhentai\.net\/galleries\/(.*)/i;
function replaceUrlFormat(url: string) {
    return url.replace(THURL, `/booba/t/$1`);
}

function ListingThumbnail(
    props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & PropsExtends
) {
    const { src, doujinId, doujinTitle, doujinLang, height, width, ...rest } = props;

    let sources = src.replace("/nh/i/", "/nh/t/").replace("https://api.ihateani.me/v1/nh/", "/booba/");
    if (src.includes("nhentai.net")) {
        sources = replaceUrlFormat(src);
    }
    const splitSources = sources.split(".");
    const startSources = splitSources.slice(0, splitSources.length - 1).join(".");
    const extension = splitSources[splitSources.length - 1];
    sources = startSources + "." + extension;

    const [padding, setPadding] = useState(2);
    const [hovered, setHovered] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    function onHover() {
        const BASE = 19;
        if (ref && ref.current) {
            setPadding(ref.current.offsetHeight - BASE + 2);
            // setPadding(ref.current.clientHeight + 2);
        }
        setHovered(true);
    }

    function onLeave() {
        setPadding(2);
        setHovered(false);
    }

    return (
        <div className="h-full self-start mx-auto">
            <div
                className={`${hovered ? "shadow-lg" : ""}`}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                onTouchStart={onHover}
                onTouchEnd={onLeave}
            >
                <Link href={`/read/${doujinId}`} prefetch={false} passHref>
                    <a className="h-full">
                        <LazyLoad height={height} once>
                            <img
                                {...rest}
                                src={sources}
                                className="object-contain object-top bg-gray-700"
                                loading="lazy"
                                alt="Thumbnail"
                                style={{
                                    filter: `brightness(${hovered ? "110" : "100"}%)`,
                                    boxShadow: "",
                                }}
                                width={width}
                                height={height}
                            />
                        </LazyLoad>
                        <div
                            id={`details-${doujinId}`}
                            className="left-0 right-0 leading-4 top-full z-10 overflow-hidden w-full max-h-[34px] bg-gray-500 text-gray-50 block font-bold text-center rounded-b-md mt-[-0.35rem] text-sm"
                            style={{ padding: `2px 0 ${padding}px 0` }}
                        >
                            <CountryFlag countryCode={doujinLang} className="mx-1" svg />
                            <span ref={ref} className="mx-1">
                                {doujinTitle}
                            </span>
                        </div>
                    </a>
                </Link>
            </div>
        </div>
    );
}

interface ImagesGallery {
    galleries: nhInfoWebResult[];
}

export default function ListingThumbnailGallery(props: ImagesGallery) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 items-start">
            {props.galleries.map((gallery) => {
                const { cover_art, title, language } = gallery;

                return (
                    <ListingThumbnail
                        src={cover_art.url}
                        key={`thumb-${gallery.id}`}
                        doujinId={gallery.id}
                        doujinTitle={title}
                        doujinLang={language}
                        height={gallery.cover_art.sizes[1]}
                        width={gallery.cover_art.sizes[0]}
                    />
                );
            })}
        </div>
    );
}
