import Link from "next/link";
import React, { PropsWithChildren } from "react";

import {
    LazyComponentProps,
    LazyLoadImage,
    LazyLoadImageProps,
    trackWindowScroll,
} from "react-lazy-load-image-component";

import { nhImage } from "../../lib/types";

interface PropsExtends extends LazyLoadImageProps {
    doujinId: string;
    pageNo: number;
}

export function ReaderThumbnail(
    props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & PropsExtends
) {
    const { src, doujinId, pageNo, ...rest } = props;
    let sources = src.replace("/nh/i/", "/nh/t/");
    const splitSources = sources.split(".");
    const startSources = splitSources.slice(0, splitSources.length - 1).join(".") + "t";
    const extension = splitSources[splitSources.length - 1];
    sources = startSources + "." + extension;

    return (
        <div className="h-full self-start mx-auto">
            <Link href={`/read/${doujinId}/${pageNo}`} prefetch={false} passHref>
                <a>
                    <LazyLoadImage
                        {...rest}
                        src={sources}
                        className="object-contain object-top filter hover:brightness-110"
                        loading="lazy"
                        alt="Thumbnail"
                        scrollPosition={props.scrollPosition}
                        effect="opacity"
                    />
                </a>
            </Link>
        </div>
    );
}

interface ImagesGallery extends PropsWithChildren<LazyComponentProps> {
    doujinId: string;
    images: nhImage[];
    thumbnailSizes: number[];
}

function ReaderThumbnailGallery(props: ImagesGallery) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 items-start">
            {props.images.map((image, idx) => {
                return (
                    <ReaderThumbnail
                        src={image.url}
                        key={`thumb-${props.doujinId}-p${idx + 1}`}
                        doujinId={props.doujinId}
                        pageNo={idx + 1}
                        scrollPosition={props.scrollPosition}
                    />
                );
            })}
        </div>
    );
}

export default trackWindowScroll(ReaderThumbnailGallery);
