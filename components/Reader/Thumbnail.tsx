import Link from "next/link";
import React from "react";

interface PropsExtends {
    doujinId: string;
    pageNo: number;
}

export default function ReaderThumbnail(
    props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & PropsExtends
) {
    const { src, ...rest } = props;
    let sources = src.replace("/nh/i/", "/nh/t/");
    const splitSources = sources.split(".");
    const startSources = splitSources.slice(0, splitSources.length - 1).join(".") + "t";
    const extension = splitSources[splitSources.length - 1];
    sources = startSources + "." + extension;

    return (
        <div className="h-full self-start filter hover:brightness-110">
            <Link href={`/read/${props.doujinId}/${props.pageNo}`} prefetch={false} passHref>
                <a>
                    <img
                        {...rest}
                        src={sources}
                        className="object-contain object-top"
                        loading="lazy"
                        alt="Thumbnail"
                    />
                </a>
            </Link>
        </div>
    );
}
