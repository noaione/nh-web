import Link from "next/link";
import React from "react";
import LazyLoad from "react-lazyload";

import { nhImage } from "../../lib/types";

interface PropsExtends {
    doujinId: string;
    pageNo: number;
}

function ReaderThumbnailNew(
    props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & PropsExtends
) {
    const { src, doujinId, pageNo, height, width, ...rest } = props;

    let sources = src.replace("/nh/i/", "/nh/t/").replace("https://api.ihateani.me/v1/nh/", "/booba/");
    const splitSources = sources.split(".");
    const startSources = splitSources.slice(0, splitSources.length - 1).join(".") + "t";
    const extension = splitSources[splitSources.length - 1];
    sources = startSources + "." + extension;

    return (
        <div className="h-full self-start mx-auto p-1">
            <Link href={`/read/${doujinId}/${pageNo}`} prefetch={false} passHref>
                <a className="inline-block">
                    <LazyLoad height={height} once>
                        <img
                            {...rest}
                            src={sources}
                            className="object-contain object-top filter hover:brightness-110 bg-gray-700"
                            loading="lazy"
                            alt="Thumbnail"
                            width={width}
                            height={height}
                        />
                    </LazyLoad>
                </a>
            </Link>
        </div>
    );
}

interface ImagesGallery {
    doujinId: string;
    images: nhImage[];
    thumbnailSizes: number[];
}

export default function ReaderThumbnailGallery(props: ImagesGallery) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 items-start">
            {props.images.map((image, idx) => {
                return (
                    <ReaderThumbnailNew
                        src={image.url}
                        key={`thumb-${props.doujinId}-p${idx + 1}`}
                        doujinId={props.doujinId}
                        pageNo={idx + 1}
                        height={props.thumbnailSizes[1]}
                        width={props.thumbnailSizes[0]}
                    />
                );
            })}
        </div>
    );
}
