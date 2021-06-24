import React from "react";
import Head from "next/head";
import { GetStaticPropsContext } from "next";

import { saveAs } from "file-saver";

import Layout from "../../../components/Layout";

import { nhImage, nhInfoRawResult, nhInfoResult, RawGQLData } from "../../../lib/types";

import { queryFetch } from "../../../lib/api";
import { imageFetchWithRetry, resolveDelayCrawlerPromises } from "../../../lib/fetcher";
import { isNone, walk } from "../../../lib/utils";

import JSZip from "jszip";

const DownloadSchemas = `query DownloadQuery($id:ID!) {
    nhentai {
        info(doujin_id:$id) {
            id
            media_id
            title {
                simple
                english
                japanese
            }
            cover_art {
                type
                url
                original_url
                sizes
            }
            tags {
                artists {
                    name
                    amount
                }
                categories {
                    name
                    amount
                }
                groups {
                    name
                    amount
                }
                languages {
                    name
                    amount
                }
                tags {
                    name
                    amount
                }
                parodies {
                    name
                    amount
                }
                characters {
                    name
                    amount
                }
            }
            images {
                type
                url
                original_url
                sizes
            }
            url
            publishedAt
            favorites
            total_pages
        }
    }
}`;

interface ValueUpdater {
    value: number;
}

class ProgressBar extends React.Component<ValueUpdater, ValueUpdater> {
    constructor(props) {
        super(props);
        this.getColorHSL = this.getColorHSL.bind(this);
        this.state = {
            value: this.props.value,
        };
    }

    getColorHSL(value: number) {
        const realValue = value / 100;
        const hue = ((0 + realValue) * 120).toString(10);
        return `hsl(${hue}, 100%, 75%)`;
    }

    update(value: number) {
        this.setState({ value });
    }

    complete() {
        this.setState({ value: 100 });
    }

    reset() {
        this.setState({ value: 0 });
    }

    render() {
        const colorHSL = this.getColorHSL(this.state.value);
        return (
            <div className="w-full bg-gray-700 rounded-full">
                <div
                    style={{
                        width: `${this.state.value}%`,
                        height: "1.25rem",
                        transition: "width 0.25s ease, background-color 0.25s ease",
                        backgroundColor: colorHSL,
                    }}
                    className="rounded-full"
                />
            </div>
        );
    }
}

interface DownloaderPagesProps {
    data: nhInfoResult;
}

interface DownloaderPagesState {
    downloaded: number;
    isCompleted: boolean;
}

class DownloaderPages extends React.Component<DownloaderPagesProps, DownloaderPagesState> {
    progressBarRef: React.RefObject<ProgressBar>;

    constructor(props) {
        super(props);
        this.updateProgress = this.updateProgress.bind(this);
        this.calculatePercentage = this.calculatePercentage.bind(this);
        this.progressBarRef = React.createRef<ProgressBar>();
        this.state = {
            downloaded: 0,
            isCompleted: false,
        };
    }

    calculatePercentage(downloaded: number) {
        const { images } = this.props.data;
        return Math.floor((downloaded / images.length) * 100);
    }

    updateProgress() {
        const nowDownloader = this.state.downloaded + 1;
        this.setState({ downloaded: nowDownloader }, () => {
            if (this.progressBarRef && this.progressBarRef.current) {
                if (nowDownloader === this.props.data.images.length) {
                    this.progressBarRef.current.complete();
                } else {
                    const percentage = this.calculatePercentage(nowDownloader);
                    this.progressBarRef.current.update(percentage);
                }
            }
        });
    }

    async componentDidMount() {
        console.info("[Downloader] Initiating downloader...");
        const zipFile = new JSZip();
        console.info("[Downloader] Saving JSON data...");
        zipFile.file("_ihateani.me.json", JSON.stringify(this.props.data, undefined, 4));
        console.info(`[Downloader] Starting to download images... (total ${this.props.data.images.length})`);
        const fileNameSave = `ihateani.me-${this.props.data.id} — ${this.props.data.title.simple}.zip`;

        const { total_pages } = this.props.data;

        let zeros = 1;
        if (total_pages < 10) {
            zeros = 1;
        } else if (total_pages < 100) {
            zeros = 2;
        } else if (total_pages < 1000) {
            zeros = 3;
        } else {
            zeros = 4;
        }

        const outerThis = this;

        async function downloadImages(image: nhImage, index: number) {
            const splittedUrl = image.url.split(".");
            const realExtension = splittedUrl.slice(splittedUrl.length - 1, splittedUrl.length)[0];
            const imageName = ("000" + (index + 1)).slice(-zeros) + "." + realExtension;
            const imageUrl = image.url;
            let reimagineImageUrl = "/booba/";
            reimagineImageUrl += imageUrl.replace("https://api.ihateani.me/v1/nh/", "");
            const blobImages = await imageFetchWithRetry(reimagineImageUrl);
            if (!isNone(blobImages)) {
                zipFile.file(imageName, blobImages, { binary: true });
                outerThis.updateProgress();
            }
            return true;
        }

        const mappedData = this.props.data.images.map(async (image, index) =>
            downloadImages(image, index).then(() => console.info(`Downloaded ${image.url}`))
        );
        const delayedCrawl = resolveDelayCrawlerPromises(mappedData, 500);

        await Promise.all(delayedCrawl);
        zipFile
            .generateAsync({
                type: "blob",
            })
            .then((content) => {
                saveAs(content, fileNameSave, { autoBom: true });
                console.info("[Downloader] Completed!");
                outerThis.setState({ isCompleted: true });
            });
    }

    render() {
        const { id, media_id, title, total_pages, images, cover_art } = this.props.data;
        const { simple, japanese, english } = title;
        const outerThis = this;

        const mainTitle = simple || english || japanese;
        const realTitle = japanese || simple;

        const coverArtUrl = cover_art.url.split(".");
        const coverExts = coverArtUrl[coverArtUrl.length - 1];
        const ogThumb = `https://nh-web.vercel.app/dynimg.png?id=${media_id}.${coverExts}&title=${encodeURI(
            mainTitle
        )}&type=down`;
        return (
            <>
                <Head>
                    <title>{mainTitle} :: nhProxy</title>
                </Head>
                <Layout
                    title={mainTitle + " - Download"}
                    description="Download Doujin from nHentai without blocking, made for naoTimes"
                    mode="downloader"
                    urlPath={"/download/" + id}
                    image={ogThumb}
                >
                    <div className="flex flex-col w-full">
                        <div className="mt-4 text-3xl font-bold break-all">{mainTitle}</div>
                        <div className="mt-2 text-xl font-light">{realTitle}</div>
                        <div className="mt-2">Total pages: {total_pages}</div>
                    </div>
                    <div className="flex flex-col mt-4">
                        <div className="flex flex-col">
                            {this.state.isCompleted ? (
                                <span className="text-sm font-semibold">Downloaded!</span>
                            ) : outerThis.state.downloaded === images.length ? (
                                <span className="text-sm font-semibold">Downloaded, saving to disk...</span>
                            ) : (
                                <span className="text-sm font-semibold">
                                    Downloading: {outerThis.state.downloaded}
                                    {"/"}
                                    {images.length}
                                </span>
                            )}
                            <span className="text-sm font-semibold"></span>
                        </div>
                        <div className="flex flex-row w-full justify-center mt-4 items-center gap-2">
                            <ProgressBar ref={this.progressBarRef} value={0} />
                            <span>{this.calculatePercentage(this.state.downloaded)}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col mt-4 w-full">
                        <img className="rounded-lg w-full md:w-2/3 lg:w-1/2" src={images[0].url} />
                    </div>
                </Layout>
            </>
        );
    }
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
    const { id } = params;
    if (typeof id !== "string") {
        return {
            notFound: true,
        };
    }

    const selectFirst = Array.isArray(id) ? id[0] : id;

    const res = await queryFetch<RawGQLData<nhInfoRawResult>>(DownloadSchemas, { id: selectFirst });
    const rawData = walk<nhInfoResult>(res, "data.nhentai.info");
    if (isNone(rawData)) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            data: rawData,
        },
    };
}

export async function getStaticPaths() {
    return { paths: [], fallback: "blocking" };
}

export default DownloaderPages;
