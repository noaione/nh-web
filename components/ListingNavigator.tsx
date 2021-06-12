import React from "react";
import Router from "next/router";

import FirstIcon from "@heroicons/react/solid/ChevronDoubleLeftIcon";
import PrevIcon from "@heroicons/react/solid/ChevronLeftIcon";
import NextIcon from "@heroicons/react/solid/ChevronRightIcon";
import Lasticon from "@heroicons/react/solid/ChevronDoubleRightIcon";

import { isNone } from "../lib/utils";
import Link from "next/link";

interface NavProps {
    current: number;
    total: number;
    query?: string;
}

function buildUrl(page: number, query?: string) {
    if (isNone(query)) {
        return `/?page=${page}`;
    }
    return `/search?q=${query}&page=${page}`;
}

export default function ListingNavigator(props: NavProps) {
    const { query, current, total } = props;
    const maxPerPreview = 5;

    let firstUrl = null;
    let prevUrl = null;
    let nextUrl = null;
    let finalUrl = null;
    if (current > 1) {
        firstUrl = buildUrl(1, query);
        prevUrl = buildUrl(current - 1, query);
    }
    if (current < total || current > total) {
        nextUrl = buildUrl(current + 1, query);
        finalUrl = buildUrl(total, query);
    }

    const createPrev = [];
    const createNext = [];
    if (current === 1) {
        let addedCount = 0;
        for (let i = 2; i < total; i++) {
            if (addedCount >= maxPerPreview) {
                break;
            }
            createNext.push(i);
            addedCount++;
        }
    } else if (current === total) {
        let addedCount = 0;
        for (let i = total - 1; i > 0; i--) {
            if (addedCount >= maxPerPreview) {
                break;
            }
            createPrev.push(i);
            addedCount++;
        }
    } else {
        let addedCount = 0;
        for (let i = current + 1; i < total; i++) {
            if (addedCount >= maxPerPreview) {
                break;
            }
            createNext.push(i);
            addedCount++;
        }
        addedCount = 0;
        for (let i = current - 1; i > 0; i--) {
            if (addedCount >= maxPerPreview) {
                break;
            }
            createPrev.push(i);
            addedCount++;
        }
    }

    function navigateLink(ev: React.MouseEvent<HTMLAnchorElement>) {
        ev.preventDefault();
        const linkData = ev.currentTarget.href;
        if (isNone(linkData)) {
            return;
        }
        Router.push(linkData);
    }

    return (
        <div className="flex flex-row flex-wrap gap-2 justify-center mx-auto">
            {/* Show nav prev */}
            <a
                href={firstUrl}
                className={
                    isNone(firstUrl)
                        ? "hidden md:block md:invisible p-3"
                        : "p-3 rounded-full hover:bg-gray-600"
                }
                onClick={navigateLink}
            >
                <FirstIcon className="h-5 w-5" />
            </a>
            <a
                href={prevUrl}
                className={
                    isNone(prevUrl)
                        ? "hidden md:block md:invisible p-3"
                        : "p-3 rounded-full hover:bg-gray-600"
                }
                onClick={navigateLink}
            >
                <PrevIcon className="h-5 w-5" />
            </a>
            {/* Show extra prev */}
            {createPrev.reverse().map((pos) => {
                return (
                    <Link key={`nav-prev-${pos}`} href={buildUrl(pos, query)} passHref>
                        <a>
                            <div className="px-4 py-2 rounded-full hover:bg-gray-600 font-bold select-none">
                                {pos}
                            </div>
                        </a>
                    </Link>
                );
            })}
            {/* Show selected */}
            <div className="px-4 py-2 rounded-full bg-gray-700 font-bold select-none">{current}</div>
            {/* Show extra next */}
            {createNext.map((pos) => {
                return (
                    <Link key={`nav-next-${pos}`} href={buildUrl(pos, query)} passHref>
                        <a>
                            <div className="px-4 py-2 rounded-full hover:bg-gray-600 font-bold select-none">
                                {pos}
                            </div>
                        </a>
                    </Link>
                );
            })}
            {/* Show nav next */}
            <a
                href={nextUrl}
                className={
                    isNone(nextUrl)
                        ? "hidden md:block md:invisible p-3"
                        : "p-3 rounded-full hover:bg-gray-600"
                }
                onClick={navigateLink}
            >
                <NextIcon className="h-5 w-5" />
            </a>
            <a
                href={finalUrl}
                className={
                    isNone(finalUrl)
                        ? "hidden md:block md:invisible p-3"
                        : "p-3 rounded-full hover:bg-gray-600"
                }
                onClick={navigateLink}
            >
                <Lasticon className="h-5 w-5" />
            </a>
        </div>
    );
}
