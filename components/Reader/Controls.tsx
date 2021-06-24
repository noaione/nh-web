import React from "react";
import Router from "next/router";
import Link from "next/link";

import BackIcon from "@heroicons/react/solid/ReplyIcon";
import FirstIcon from "@heroicons/react/solid/ChevronDoubleLeftIcon";
import PrevIcon from "@heroicons/react/solid/ChevronLeftIcon";
import NextIcon from "@heroicons/react/solid/ChevronRightIcon";
import Lasticon from "@heroicons/react/solid/ChevronDoubleRightIcon";
import SettingsIcon from "@heroicons/react/solid/CogIcon";

import Modal, { CallbackModal } from "../Modal";

import { isNone } from "../../lib/utils";
import { getSettings, saveSettings, Settings } from "../../lib/storage";

interface ControlsProps {
    page: number;
    totalPages: number;
    doujinId: string;
    onSettingsUpdate: (newSettigns: Settings) => void;
}

interface SettingsCallback {
    show: () => void;
}

interface SettingsProps {
    onMounted: (cb: SettingsCallback) => void;
    onChange: (newSettings: Settings) => void;
}

type UpdatedMutable<Type> = {
    [Prop in keyof Type as `mut${Capitalize<string & Prop>}`]: Type[Prop];
};

type SettingsState = Settings & UpdatedMutable<Settings>;

class ReaderSettings extends React.Component<SettingsProps, SettingsState> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.handleShow = this.handleShow.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.closeDownModal = this.closeDownModal.bind(this);
        this.state = {
            mutPreload: 3,
            mutScaling: "fill",
            preload: 3,
            scaling: "fill",
        };
    }

    componentDidMount() {
        if (typeof this.props.onMounted === "function") {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const outerThis = this;
            this.props.onMounted({
                show: () => outerThis.handleShow(),
            });
        }
        const realSettings = getSettings(window.localStorage);
        this.setState({ ...realSettings });
    }

    handleShow() {
        if (this.modalCb) {
            this.modalCb.showModal();
        }
    }

    handleHide() {
        if (this.modalCb) {
            this.modalCb.hideModal();
        }
    }

    updateSettings() {
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
            console.info("Updating settings...");
            saveSettings(this.state, window.localStorage);
        }
        this.setState({ preload: this.state.mutPreload, scaling: this.state.mutScaling }, () => {
            this.props.onChange(this.state);
        });
        this.handleHide();
    }

    closeDownModal() {
        this.setState({ mutPreload: this.state.preload, mutScaling: this.state.scaling }, () => {
            this.handleHide();
        });
    }

    render() {
        return (
            <Modal onMounted={(cb) => (this.modalCb = cb)} className="modal-width max-w-[800px]">
                <Modal.Head className="text-3xl !text-center">Settings</Modal.Head>
                <Modal.Body innerClassName="!mt-4 text-lg flex flex-col gap-2">
                    <div className="flex flex-row justify-between items-center">
                        <div className="font-bold">Preload</div>
                        <select
                            className="form-select bg-gray-800 rounded-lg border-gray-700 hover:border-gray-400 transition duration-200"
                            value={this.state.mutPreload}
                            onChange={(e) => this.setState({ mutPreload: parseInt(e.target.value) })}
                        >
                            <option value="0">Disabled</option>
                            <option value="1">1 page</option>
                            <option value="2">2 pages</option>
                            <option value="3">3 pages</option>
                            <option value="4">4 pages</option>
                            <option value="5">5 pages</option>
                        </select>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <div className="font-bold">Image Fit</div>
                        <select
                            className="form-select bg-gray-800 rounded-lg border-gray-700 hover:border-gray-400 transition duration-200"
                            value={this.state.mutScaling}
                            onChange={(e) => this.setState({ mutScaling: e.target.value as "fit" | "fill" })}
                        >
                            <option value="fill">Fill Horizontal</option>
                            <option value="fit">Fit to Screen</option>
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer innerClassName="flex-row justify-center gap-2">
                    <button
                        onClick={this.updateSettings}
                        className="inline-flex justify-center font-semibold w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-700 focus:outline-none transition"
                    >
                        Save
                    </button>
                    <button
                        onClick={this.closeDownModal}
                        className="inline-flex justify-center font-semibold w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-700 focus:outline-none transition"
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default class ReaderControls extends React.Component<ControlsProps> {
    settingsCb?: SettingsCallback;

    constructor(props) {
        super(props);
        this.navigateLink = this.navigateLink.bind(this);
        this.navigateToPage = this.navigateToPage.bind(this);
        this.handleShow = this.handleShow.bind(this);
    }

    navigateLink(ev: React.MouseEvent<HTMLAnchorElement>) {
        ev.preventDefault();
        const linkData = ev.currentTarget.href;
        if (isNone(linkData)) {
            return;
        }
        Router.push(linkData, undefined, { shallow: true });
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
            Router.push(`/read/${doujinId}/${parsedNum}`, undefined, { shallow: true });
        } else {
            alert(`Invalid number entered: ${parsedNum}, must be from 1-${totalPages}`);
        }
    }

    handleShow() {
        if (this.settingsCb) {
            this.settingsCb.show();
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
            <>
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
                        <div onClick={() => this.handleShow()} className="leading-5 p-3 hover:bg-gray-600">
                            <SettingsIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <ReaderSettings
                    onMounted={(cb) => (this.settingsCb = cb)}
                    onChange={(setting) => {
                        // forward update.
                        this.props.onSettingsUpdate(setting);
                    }}
                />
            </>
        );
    }
}
