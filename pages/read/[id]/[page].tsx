import React from "react";
import ErrorPage from "next/error";
import Head from "next/head";
import router, { NextRouter, withRouter } from "next/router";
import { GetStaticPropsContext } from "next";
import axios from "axios";

import Layout from "../../../components/Layout";
import ReaderComponent from "../../../components/Reader";

import { nhImage, nhInfoRawResult, nhInfoResult, nhTitle, RawGQLData } from "../../../lib/types";

import { queryFetch } from "../../../lib/api";
import { isNone, walk } from "../../../lib/utils";

const ImageReaderSchemas = `query ReaderQuery($id:ID!) {
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
            }
            images {
                url
            }
            url
            total_pages
        }
    }
}`;

interface ReaderImageProps {
    images: nhImage[];
    id: string;
    media_id: string;
    title: nhTitle;
    cover_art: nhImage;
    total_pages: number;
    page: number;
    notFound?: boolean;
    realUrl: string;
}

interface WithRouterProps extends ReaderImageProps {
    router: NextRouter;
}

interface ReaderState {
    page: number;
    prefetched: number[];
}

class ReaderPerPagePages extends React.Component<WithRouterProps, ReaderState> {
    constructor(props) {
        super(props);
        this.prefetchImage = this.prefetchImage.bind(this);
        this.downloadImage = this.downloadImage.bind(this);
        this.paginateWithKey = this.paginateWithKey.bind(this);
        this.state = {
            page: this.props.page,
            prefetched: [],
        };
    }

    async downloadImage(pageNo: number) {
        const { images } = this.props;
        const imgData = images[pageNo - 1];
        if (isNone(imgData)) {
            return false;
        }
        try {
            const res = await axios.get(imgData.url);
            if (res.status === 200) {
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    async prefetchImage() {
        const MAX_PREFETCH = 3;
        const { id, total_pages, notFound } = this.props;
        const { page } = this.state;
        if (!notFound) {
            console.info("Start prefetching...");
            const prefetchPages: number[] = [];
            if (page === 1) {
                let addedCount = 0;
                for (let i = 2; i < total_pages; i++) {
                    if (addedCount >= MAX_PREFETCH) {
                        break;
                    }
                    prefetchPages.push(i);
                    addedCount++;
                }
            } else if (page === total_pages) {
                let addedCount = 0;
                for (let i = total_pages - 1; i > 0; i--) {
                    if (addedCount >= MAX_PREFETCH) {
                        break;
                    }
                    prefetchPages.push(i);
                    addedCount++;
                }
            } else {
                let addedCount = 0;
                for (let i = page + 1; i < total_pages; i++) {
                    if (addedCount >= MAX_PREFETCH) {
                        break;
                    }
                    prefetchPages.push(i);
                    addedCount++;
                }
                addedCount = 0;
                for (let i = page - 1; i > 0; i--) {
                    if (addedCount >= MAX_PREFETCH) {
                        break;
                    }
                    prefetchPages.push(i);
                    addedCount++;
                }
            }

            for (let i = 0; i < prefetchPages.length; i++) {
                const prePage = prefetchPages[i];
                if (this.state.prefetched.includes(prePage)) {
                    console.info("[Prefetch]", "Page", prePage, "already prefetched!");
                    return;
                }
                console.info("[Prefetch]", "Page", prePage);
                console.info("[Prefetch]", `/read/${id}/${prePage}`, "starting...");

                const res = await this.downloadImage(prePage);
                if (res) {
                    this.setState((prev) => {
                        const { prefetched } = prev;
                        prefetched.push(prePage);
                        return { prefetched };
                    });
                }

                console.info("[Prefetch]", `/read/${id}/${prePage}`, "finished prefetching...");
            }
        }
    }

    paginateWithKey(ev: KeyboardEvent) {
        if (ev.key === "ArrowLeft") {
            if (this.state.page === 1) {
                return;
            }
            router.push(`/read/${this.props.id}/${this.state.page - 1}`, undefined, { shallow: true });
        } else if (ev.key === "ArrowRight") {
            if (this.state.page === this.props.total_pages) {
                return;
            }
            router.push(`/read/${this.props.id}/${this.state.page + 1}`, undefined, { shallow: true });
        }
    }

    async componentDidMount() {
        await this.prefetchImage();
        document.addEventListener("keyup", this.paginateWithKey);
    }

    componentWillUnmount() {
        document.removeEventListener("keyup", this.paginateWithKey);
    }

    async componentDidUpdate(prevProps: WithRouterProps, prevState: ReaderState) {
        const { query } = this.props.router;
        const { page } = query;
        const parsed = parseInt(page as string);
        if (parsed !== prevState.page) {
            this.setState({ page: parsed }, () => {
                this.prefetchImage()
                    .then(() => {
                        return;
                    })
                    .catch(() => {
                        return;
                    });
            });
        }
    }

    render() {
        const { id, media_id, title, total_pages, images, notFound } = this.props;
        const { page } = this.state;
        if (notFound) {
            return <ErrorPage statusCode={404} />;
        }
        const { simple, japanese, english } = title;

        const mainTitle = simple || english || japanese;
        let realTitle = japanese || simple;
        if (realTitle === mainTitle) {
            realTitle = english || simple;
        }

        let urlNext = "/read/" + id + "/";
        if (page === 1 && page + 1 === total_pages) {
            urlNext = "#";
        } else if (page + 1 === total_pages) {
            urlNext = "#";
        } else if (page + 1 < total_pages) {
            urlNext += (page + 1).toString();
        }

        const imageCurrentPage = images[page - 1];
        if (isNone(imageCurrentPage)) {
            return <ErrorPage statusCode={404} />;
        }

        const coverArtUrl = images[0].url.split(".");
        const coverExts = coverArtUrl[coverArtUrl.length - 1];
        const ogThumb = `https://nh-web.vercel.app/dynimg.png?id=${media_id}.${coverExts}&title=${encodeURI(
            mainTitle
        )}&page=${page}`;

        return (
            <>
                <Head>
                    <title>
                        Page {page} - {mainTitle} :: nhProxy
                    </title>
                </Head>
                <Layout
                    title={`Page ${page} - ` + mainTitle + " - Read"}
                    description="Read Doujin from nHentai without blocking, made for naoTimes"
                    mode="reader"
                    urlPath={"/read/" + id + `/${page}`}
                    image={ogThumb}
                    mainClassName="mx-0"
                >
                    <div className="flex-1 overflow-x-hidden overflow-y-auto py-6">
                        <ReaderComponent.Container className="mt-4 mb-6 mx-0 px-0 py-0 justify-center w-full max-w-full flex-0 bg-gray-900">
                            <ReaderComponent.Controls page={page} totalPages={total_pages} doujinId={id} />
                            <ReaderComponent.Image
                                id={id}
                                page={page}
                                totalPages={total_pages}
                                navigateUrl={urlNext}
                                imageUrl={imageCurrentPage.url}
                            />
                            <ReaderComponent.Controls page={page} totalPages={total_pages} doujinId={id} />
                        </ReaderComponent.Container>
                    </div>
                </Layout>
            </>
        );
    }
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
    const { id, page } = params;
    if (typeof id !== "string" || typeof page !== "string") {
        return {
            notFound: true,
        };
    }
    const pageNo = parseInt(page);
    if (isNaN(pageNo)) {
        return {
            notFound: true,
        };
    }

    const selectFirst = Array.isArray(id) ? id[0] : id;

    const apiResult = await queryFetch<RawGQLData<nhInfoRawResult>>(ImageReaderSchemas, {
        id: selectFirst,
    });
    const rawData = walk<nhInfoResult>(apiResult, "data.nhentai.info");
    if (isNone(rawData)) {
        return {
            notFound: true,
        };
    }

    const { images, total_pages } = rawData;
    if (images.length < 1) {
        return {
            notFound: true,
        };
    }
    const selectPage = pageNo - 1;
    if (selectPage < 0 || selectPage > total_pages - 1) {
        return {
            notFound: true,
        };
    }

    const imgPage = images[pageNo - 1];
    if (isNone(imgPage)) {
        return {
            notFound: true,
        };
    }

    const results: ReaderImageProps = {
        id: rawData.id,
        media_id: rawData.media_id,
        images: images,
        title: rawData.title,
        cover_art: rawData.cover_art,
        realUrl: rawData.url,
        total_pages: rawData.total_pages,
        page: pageNo,
    };

    return {
        props: results,
    };
}

export async function getStaticPaths() {
    return { paths: [], fallback: "blocking" };
}

export default withRouter(ReaderPerPagePages);
