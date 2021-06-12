import Link from "next/link";
import React, { PropsWithChildren, useRef, useState } from "react";

import {
    LazyComponentProps,
    LazyLoadImage,
    LazyLoadImageProps,
    trackWindowScroll,
} from "react-lazy-load-image-component";
import CountryFlag from "./CountryFlag";

import { nhInfoResult, nhTag } from "../lib/types";

interface PropsExtends extends LazyLoadImageProps {
    doujinId: string;
    doujinTitle: string;
    doujinLang: string;
}

function ListingThumbnail(
    props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & PropsExtends
) {
    const { src, doujinId, doujinTitle, doujinLang, ...rest } = props;
    let sources = src.replace("/nh/i/", "/nh/t/");
    const splitSources = sources.split(".");
    const startSources = splitSources.slice(0, splitSources.length - 1).join(".") + "t";
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
        <div
            className="h-full self-start mx-auto"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onTouchStart={onHover}
            onTouchEnd={onLeave}
        >
            <div className={`${hovered ? "shadow-lg" : ""}`}>
                <Link href={`/read/${doujinId}`} prefetch={false} passHref>
                    <a className="h-full">
                        <LazyLoadImage
                            {...rest}
                            src={sources}
                            className="object-contain object-top"
                            loading="lazy"
                            alt="Thumbnail"
                            scrollPosition={props.scrollPosition}
                            effect="opacity"
                            style={{
                                filter: `brightness(${hovered ? "110" : "100"}%)`,
                                boxShadow: "",
                            }}
                        />
                        <div
                            id={`details-${doujinId}`}
                            className="left-0 right-0 leading-4 top-full z-10 overflow-hidden w-full max-h-[34px] bg-gray-500 text-gray-50 block font-bold text-center rounded-b-md mt-[-0.35rem] text-sm"
                            style={{ padding: `0 0 ${padding}px 0` }}
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

function getDoujinLanguages(languages?: nhTag[]) {
    const defaultLanguage = "JP";
    if (!Array.isArray(languages)) {
        return defaultLanguage;
    }
    const languageMaps = {
        japanese: "JP",
        chinese: "CN",
        english: "GB",
        korean: "KR",
    };

    let selected;
    for (let i = 0; i < languages.length; i++) {
        const sel = languages[i];
        if (sel.name === "translated") {
            continue;
        }
        const temp = languageMaps[sel.name];
        if (typeof temp === "string") {
            selected = temp;
            break;
        }
    }

    return selected || defaultLanguage;
}

interface ImagesGallery extends PropsWithChildren<LazyComponentProps> {
    galleries: nhInfoResult[];
}

function ListingThumbnailGallery(props: ImagesGallery) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 items-start">
            {props.galleries.map((gallery) => {
                const {
                    images,
                    title: { english, japanese, simple },
                } = gallery;
                const firstImage = images[0];

                const mainTitle = simple || english || japanese;
                return (
                    <ListingThumbnail
                        src={firstImage.url}
                        key={`thumb-${gallery.id}`}
                        doujinId={gallery.id}
                        doujinTitle={mainTitle}
                        doujinLang={getDoujinLanguages(gallery.tags.languages)}
                        scrollPosition={props.scrollPosition}
                    />
                );
            })}
        </div>
    );
}

export default trackWindowScroll(ListingThumbnailGallery);
