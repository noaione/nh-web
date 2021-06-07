import React from "react";
import Router from "next/router";
import Link from "next/link";

import BackIcon from "@heroicons/react/solid/ReplyIcon";
import FirstIcon from "@heroicons/react/solid/ChevronDoubleLeftIcon";
import PrevIcon from "@heroicons/react/solid/ChevronLeftIcon";
import NextIcon from "@heroicons/react/solid/ChevronRightIcon";
import Lasticon from "@heroicons/react/solid/ChevronDoubleRightIcon";
import SettingsIcon from "@heroicons/react/solid/CogIcon";

import { isNone } from "../../lib/utils";

interface ControlsProps {
    page: number;
    totalPages: number;
    doujinId: string;
}

export default class ReaderControls extends React.Component<ControlsProps> {
    constructor(props) {
        super(props);
        this.navigateLink = this.navigateLink.bind(this);
        this.navigateToPage = this.navigateToPage.bind(this);
    }

    navigateLink(ev: React.MouseEvent<HTMLAnchorElement>) {
        ev.preventDefault();
        const linkData = ev.currentTarget.href;
        if (isNone(linkData)) {
            return;
        }
        Router.push(linkData);
    }

    navigateToPage() {
        const { doujinId, totalPages } = this.props;
        const userInput = prompt(`Enter a page (1-${totalPages})`);
        const parsedNum = parseInt(userInput);
        if (isNaN(parsedNum)) {
            alert(`Please enter a number from 1-${totalPages}`);
            return;
        }
        if (parsedNum > 0 && parsedNum <= totalPages) {
            Router.push(`/read/${doujinId}/${parsedNum}`);
        } else {
            alert(`Invalid number entered: ${parsedNum}, must be from 1-${totalPages}`);
        }
    }

    render() {
        const { page, totalPages, doujinId } = this.props;

        let firstUrl = null;
        let prevUrl = null;
        let nextUrl = null;
        let finalUrl = null;
        if (page > 1) {
            firstUrl = `/read/${doujinId}/1`;
            prevUrl = `/read/${doujinId}/${page - 1}`;
        }
        if (page < totalPages) {
            nextUrl = `/read/${doujinId}/${page + 1}`;
            finalUrl = `/read/${doujinId}/${totalPages}`;
        }

        return (
            <div className="flex flex-row justify-between bg-gray-700">
                <div className="flex self-start controls-link">
                    <Link href={`/read/${doujinId}`} passHref>
                        <a className="leading-5 p-3">
                            <BackIcon className="h-5 w-5" />
                        </a>
                    </Link>
                </div>
                <div className="flex flex-row controls-link">
                    <a
                        href={firstUrl}
                        className={isNone(firstUrl) ? "invisible p-3" : "p-3"}
                        onClick={this.navigateLink}
                    >
                        <FirstIcon className="h-5 w-5" />
                    </a>
                    <a
                        href={prevUrl}
                        className={isNone(prevUrl) ? "invisible p-3" : "p-3"}
                        onClick={this.navigateLink}
                    >
                        <PrevIcon className="h-5 w-5" />
                    </a>
                    <div
                        className="p-3 leading-5 flex flex-row gap-1 hover:bg-gray-600 select-none"
                        onClick={() => this.navigateToPage()}
                    >
                        <span className="font-bold">{page}</span>
                        <span>of</span>
                        <span className="font-bold">{totalPages}</span>
                    </div>
                    <a
                        href={nextUrl}
                        className={isNone(nextUrl) ? "invisible p-3" : "p-3"}
                        onClick={this.navigateLink}
                    >
                        <NextIcon className="h-5 w-5" />
                    </a>
                    <a
                        href={finalUrl}
                        className={isNone(finalUrl) ? "invisible p-3" : "p-3"}
                        onClick={this.navigateLink}
                    >
                        <Lasticon className="h-5 w-5" />
                    </a>
                </div>
                <div className="flex self-end">
                    <div className="leading-5 p-3 hover:bg-gray-600">
                        <SettingsIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
        );
    }
}
