import Link from "next/link";
import React from "react";

import BookIcon from "@heroicons/react/solid/BookOpenIcon";
import DownloadIcon from "@heroicons/react/solid/DownloadIcon";
import GlobeIcon from "@heroicons/react/solid/GlobeAltIcon";

interface FooterProps {
    doujinId: string;
}

export default function ReaderPagesInfoFooter(props: FooterProps) {
    const { doujinId } = props;

    return (
        <div className="flex flex-col btn-footer-row-big gap-2 mt-2">
            <Link href={`/read/${doujinId}/1`} passHref>
                <a className="px-4 py-2 font-bold rounded-md opacity-50 bg-[#ed2553] hover:bg-[#f15478] hover:opacity-100 flex flex-row gap-1 items-center">
                    <BookIcon className="w-5 h-5" />
                    <span>Read</span>
                </a>
            </Link>
            <Link href={`/download/${doujinId}`} passHref>
                <a className="px-4 py-2 font-bold rounded-md opacity-50 bg-gray-500 hover:bg-gray-400 hover:opacity-100 flex flex-row gap-1 items-center">
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download</span>
                </a>
            </Link>
            <a
                href={`https://nhentai.net/g/${doujinId}`}
                className="px-4 py-2 font-bold rounded-md opacity-50 bg-green-500 hover:bg-green-400 hover:opacity-100 flex flex-row gap-1 items-center"
                rel="noreferrer noopener"
                target="_blank"
            >
                <GlobeIcon className="w-5 h-5" />
                <span>Open @nhentai</span>
            </a>
        </div>
    );
}
