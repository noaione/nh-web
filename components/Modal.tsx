import React from "react";
import { createPortal } from "react-dom";

interface ModalState {
    show: boolean;
    currentFade?: "show" | "hide" | null;
}

export interface CallbackModal {
    showModal: () => void;
    hideModal: () => void;
    toggleModal?: () => void;
}

interface ModalProps {
    onMounted?: (callbacks: CallbackModal) => void;
    className?: string;
}

interface ExtendedModalSettings {
    className?: string;
}

class ModalHead extends React.Component<ExtendedModalSettings> {
    render() {
        const { className, children } = this.props;

        return (
            <h2
                className={
                    "text-lg text-center mt-2 font-medium leading-6 text-gray-900 dark:text-gray-100 sm:mt-0 sm:mx-2 sm:text-left " +
                    (className ?? "")
                }
            >
                {children}
            </h2>
        );
    }
}

interface ExtendedInnerModalSettings extends ExtendedModalSettings {
    innerClassName?: string;
}

class ModalBody extends React.Component<ExtendedInnerModalSettings> {
    render() {
        const { className, innerClassName, children } = this.props;

        return (
            <div className={"mt-3 text-center sm:mt-0 sm:mx-2 sm:text-left " + (className ?? "")}>
                <div
                    className={
                        "mt-2 text-sm leading-5 text-gray-500 dark:text-gray-300 " + (innerClassName ?? "")
                    }
                >
                    {children}
                </div>
            </div>
        );
    }
}

class ModalFooter extends React.Component<ExtendedInnerModalSettings> {
    render() {
        const { innerClassName, className, children } = this.props;

        return (
            <div className={"mt-5 sm:mt-6 " + (className ?? "")}>
                <span className={"flex w-full rounded-md shadow-sm " + (innerClassName ?? "")}>
                    {children}
                </span>
            </div>
        );
    }
}

interface PortalProps {
    node?: any;
    children: React.ReactNode;
}

function isDomAvailable() {
    if (typeof window !== "undefined" && window.document && window.document.createElement) {
        return true;
    }
    return false;
}

class ModalPortal extends React.Component<PortalProps> {
    defaultNode?: Element;

    async componentDidMount() {
        await import("../lib/portal-modal");
    }

    componentWillUnmount() {
        if (this.defaultNode) {
            document.body.removeChild(this.defaultNode);
        }
        this.defaultNode = null;
    }

    render() {
        if (!isDomAvailable()) {
            return null;
        }

        if (!this.props.node && !this.defaultNode) {
            this.defaultNode = document.createElement("portal-modal");
            document.body.appendChild(this.defaultNode);
        }

        return createPortal(this.props.children, this.props.node || this.defaultNode);
    }
}

class Modal extends React.Component<ModalProps, ModalState> {
    divRef?: HTMLDivElement;
    static Head = ModalHead;
    static Body = ModalBody;
    static Footer = ModalFooter;

    constructor(props: ModalProps) {
        super(props);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = {
            show: false,
            currentFade: null,
        };
    }

    componentDidMount() {
        if (typeof this.props.onMounted === "function") {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const outerThis = this;
            this.props.onMounted({
                showModal: () => outerThis.handleShow(),
                hideModal: () => outerThis.handleHide(),
                toggleModal: () => outerThis.toggleModal(),
            });
        }
    }

    handleHide() {
        if (isDomAvailable()) {
            document.body.classList.remove("overflow-y-hidden");
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const outerThis = this;
        this.setState({ currentFade: "hide" });
        // fade animation thingamagic.
        setTimeout(() => outerThis.setState({ show: false, currentFade: null }), 300);
    }

    handleShow() {
        if (isDomAvailable()) {
            document.body.classList.add("overflow-y-hidden");
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const outerThis = this;
        this.setState({ show: true, currentFade: "show" });
        setTimeout(() => outerThis.setState({ currentFade: null }), 300);
    }

    toggleModal() {
        if (this.state.show) {
            this.handleHide();
        } else {
            this.handleShow();
        }
    }

    render() {
        if (!this.state.show) {
            return null;
        }
        const fadeInTransition = "fade-in-modal";
        const fadeOutTransition = "transition ease-out duration-300 opacity-0 transform scale-90";

        let extraClasses = "";
        if (this.state.currentFade === "show") {
            extraClasses = fadeInTransition;
        } else if (this.state.currentFade === "hide") {
            extraClasses = fadeOutTransition;
        }
        if (typeof this.props.className === "string") {
            extraClasses += " " + this.props.className;
        }

        return (
            <ModalPortal>
                <div
                    ref={(ref) => (this.divRef = ref)}
                    className={`fixed top-0 left-0 ${
                        this.state.show ? "flex" : "hidden"
                    } items-center justify-center w-full h-full transition-all duration-200 backdrop-filter backdrop-blur bg-[rgba(0,0,0,0.5)] z-40 overflow-y-hidden`}
                    onClick={(ev) => {
                        if (this.divRef && ev.target === this.divRef) {
                            // Only handle if clicked outside the main div
                            this.handleHide();
                        }
                    }}
                >
                    <div
                        className={
                            "h-auto p-4 mx-6 text-left bg-white dark:bg-gray-700 rounded shadow-xl md:max-w-xl md:p-6 lg:p-8 md:mx-0 " +
                            extraClasses
                        }
                    >
                        {this.props.children}
                    </div>
                </div>
            </ModalPortal>
        );
    }
}

export default Modal;
