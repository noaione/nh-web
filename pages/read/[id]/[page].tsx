import React from "react";
import ErrorPage from "next/error";
import Head from "next/head";
import Router from "next/router";
import { GetStaticPropsContext } from "next";

import Layout from "../../../components/Layout";
import ReaderComponent from "../../../components/Reader";

import { nhImage, nhInfoRawResult, nhInfoResult, nhTitle, RawGQLData } from "../../../lib/types";

import { queryFetch } from "../../../lib/api";
import { isNone, walk } from "../../../lib/utils";

const ImageReaderSchemas = `query ReaderQuery($id:ID!) {
    nhentai {
        info(doujin_id:$id) {
            id
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
    image: nhImage;
    id: string;
    title: nhTitle;
    cover_art: nhImage;
    total_pages: number;
    page: number;
    notFound?: boolean;
    realUrl: string;
}

export default class ReaderPerPagePages extends React.Component<ReaderImageProps> {
    constructor(props) {
        super(props);
        this.state = {
            downloaded: 0,
            isCompleted: false,
        };
    }

    async componentDidMount() {
        const MAX_PREFETCH = 3;
        const { id, page, total_pages, notFound } = this.props;
        if (!notFound) {
            console.info("Start prefetching...");
            const prefetchPages = [];
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
            prefetchPages.forEach((prePage) => {
                console.info("[Prefetch]", "Page", prePage);
                console.info("[Prefetch]", `/read/${id}/${prePage}`, "starting...");
                Router.prefetch(`/read/${id}/${prePage}`);
                console.info("[Prefetch]", `/read/${id}/${prePage}`, "finished prefetching...");
            });
        }
    }

    render() {
        const { id, title, total_pages, cover_art, image, page, notFound } = this.props;
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
            urlNext = (page + 1).toString();
        }

        return (
            <>
                <Head>
                    <title>{mainTitle} :: nhProxy</title>
                </Head>
                <Layout
                    title={mainTitle + " - Read"}
                    description="Read Doujin from nHentai without blocking, made for naoTimes"
                    mode="reader"
                    urlPath={"/read/" + id}
                    image={cover_art.url}
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
                                imageUrl={image.url}
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
        image: imgPage,
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
