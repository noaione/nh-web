import React from "react";
import Link from "next/link";
import Router from "next/router";

interface ImageComponentProps {
    id: string;
    navigateUrl?: string;
    imageUrl: string;
    page: number;
    totalPages: number;
    fitType?: "fit" | "fill";
    readMode?: "ltr" | "rtl";
    sizes: number[];
}

export default function ReaderComponentImage(props: ImageComponentProps) {
    const { id, navigateUrl, imageUrl, page, totalPages, fitType, readMode, sizes } = props;
    let reimagineImageUrl = "/booba/";
    reimagineImageUrl += imageUrl.replace("https://api.ihateani.me/v1/nh/", "");

    let widthAdjust = "max-w-full h-auto";
    if (fitType === "fit") {
        widthAdjust = "max-h-[95vh] w-auto";
    }

    const [width, height] = sizes;

    return (
        <div
            className="flex justify-center overflow-x-auto overflow-y-visible max-w-full h-full"
            aria-label="Image Container"
        >
            <Link href={navigateUrl} passHref>
                {/* Disable the link navigation */}
                <a onClick={(ev) => ev.preventDefault()}>
                    <img
                        src={reimagineImageUrl}
                        className={`${widthAdjust} align-bottom select-none cursor-pointer`}
                        alt={`Image ${page} of ${totalPages}`}
                        width={width}
                        height={height}
                        onClick={(ev) => {
                            ev.preventDefault();
                            // Check if it's clicked on right/left side.
                            const halfWidth = ev.currentTarget.clientWidth / 2;
                            const { offsetX } = ev.nativeEvent;
                            let isRightSide = offsetX >= halfWidth;
                            if (readMode === "rtl") {
                                isRightSide = !isRightSide;
                            }
                            if (!isRightSide) {
                                // Dont go to previous page if already on first page.
                                if (page === 1) {
                                    return;
                                } else {
                                    Router.push(`/read/${id}/${page - 1}`, undefined, { shallow: true });
                                }
                            } else {
                                // Dont go forward if already on last page
                                if (page === totalPages) {
                                    return;
                                } else {
                                    Router.push(`/read/${id}/${page + 1}`, undefined, { shallow: true });
                                }
                            }
                        }}
                    />
                </a>
            </Link>
        </div>
    );
}
