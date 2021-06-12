import React from "react";
import Router from "next/router";

import SearchIcon from "@heroicons/react/solid/SearchIcon";

export interface NavbarProps {
    mode?: "home" | "reader" | "downloader";
    noSticky?: boolean;
    query?: string;
}

class Navbar extends React.Component<NavbarProps, Pick<NavbarProps, "query">> {
    constructor(props) {
        super(props);
        this.navigateQuerySearch = this.navigateQuerySearch.bind(this);
        this.state = {
            query: this.props.query || "",
        };
    }

    navigateQuerySearch() {
        const oldQuery = this.props.query || "";
        if (this.state.query === oldQuery) {
            return;
        }

        Router.push(`/search?q=${this.state.query}`);
    }

    render() {
        const { noSticky } = this.props;
        const { query } = this.state;

        let stickyModel = "sticky top-0 z-10";
        if (noSticky) {
            stickyModel = "";
        }

        return (
            <header className={"bg-gray-700 " + stickyModel}>
                <nav className="relative select-none bg-grey lg:flex lg:items-stretch w-full">
                    <div className="w-full relative flex flex-row md:w-auto justify-between pr-4">
                        <div className="flex flex-row items-center hover:bg-gray-600">
                            <a
                                href="/"
                                className="font-semibold text-xl tracking-tight mx-2 text-white hover:opacity-80"
                            >
                                <img src="/images/logo.svg" width={50} height={50} />
                            </a>
                        </div>
                        <div className="flex flex-row items-center my-2">
                            <input
                                className="p-2 lg:pr-[40px] w-full bg-gray-900 hover:bg-gray-800 rounded-l ml-2 focus:outline-none"
                                value={query}
                                onChange={(ev) => this.setState({ query: ev.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        this.navigateQuerySearch();
                                    }
                                }}
                            />
                            <div
                                className="p-[0.6rem] rounded-r bg-[#ed2553] hover:bg-[#f15478] cursor-pointer"
                                onClick={() => this.navigateQuerySearch()}
                            >
                                <SearchIcon className="h-5" />
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }
}

export default Navbar;
