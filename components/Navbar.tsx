import React from "react";
import Link from "next/link";

export interface NavbarProps {
    mode?: "home" | "reader" | "downloader";
    noSticky?: boolean;
}

interface NavbarState {
    active: boolean;
}

class Navbar extends React.Component<NavbarProps, NavbarState> {
    constructor(props) {
        super(props);
        this.toggleDropdown = this.toggleDropdown.bind(this);

        this.state = {
            active: false,
        };
    }

    toggleDropdown() {
        this.setState((prevState) => ({ active: !prevState.active }));
    }

    render() {
        const { mode, noSticky } = this.props;

        let homeUrl = "#";
        let downloaderUrl = "#";
        if (mode === "home") {
            downloaderUrl = "/download";
        } else if (mode === "downloader") {
            homeUrl = "/";
        } else {
            homeUrl = "/";
            downloaderUrl = "/download";
        }

        let stickyModel = "sticky top-0 z-10";
        if (noSticky) {
            stickyModel = "";
        }

        let extraClass = "hidden";
        if (this.state.active) {
            extraClass = "";
        }

        return (
            <header className={"bg-gray-700 " + stickyModel}>
                <nav className="relative select-none bg-grey lg:flex lg:items-stretch w-full py-3">
                    <div className="w-full relative flex justify-between lg:w-auto pr-4 lg:static lg:block lg:justify-start">
                        <div className="flex flex-row items-center ml-4 my-2">
                            <a
                                href="/"
                                className="font-semibold text-xl tracking-tight ml-2 text-white hover:opacity-80"
                            >
                                nhProxy API
                            </a>
                        </div>
                        <button
                            onClick={this.toggleDropdown}
                            className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                            type="button"
                        >
                            <span className="block relative w-6 h-px rounded-sm bg-white"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                        </button>
                    </div>

                    <div
                        className={
                            extraClass +
                            " mt-4 lg:mt-0 lg:flex lg:items-stretch lg:flex-no-shrink lg:flex-grow"
                        }
                    >
                        <div className="lg:flex lg:items-stretch lg:justify-end ml-auto mr-4">
                            <Link href={homeUrl} passHref>
                                <a className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                                    Home
                                </a>
                            </Link>
                            <Link href={downloaderUrl} passHref>
                                <a className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                                    Downloader
                                </a>
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }
}

export default Navbar;
