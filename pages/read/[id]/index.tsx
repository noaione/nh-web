import React from "react";
import Head from "next/head";
import Link from "next/link";
import { NextPageContext } from "next";

import Layout from "../../../components/Layout";
import ReaderComponent from "../../../components/Reader";

import { nhInfoRawResult, nhInfoResult, RawGQLData } from "../../../lib/types";

import { queryFetch } from "../../../lib/api";
import { isNone, walk } from "../../../lib/utils";
import ReactTimeago from "react-timeago";

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

interface DownloaderPagesProps {
    data: nhInfoResult;
}

export default class ReaderPages extends React.Component<DownloaderPagesProps> {
    static async getInitialProps({ query }: NextPageContext) {
        const { id } = query;
        if (typeof id !== "string") {
            return {
                notFound: true,
            };
        }

        const selectFirst = Array.isArray(id) ? id[0] : id;

        const res = await queryFetch<RawGQLData<nhInfoRawResult>>(ImageReaderSchemas, { id: selectFirst });
        const rawData = walk<nhInfoResult>(res, "data.nhentai.info");
        if (isNone(rawData)) {
            return {
                notFound: true,
            };
        }

        return {
            data: rawData,
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            downloaded: 0,
            isCompleted: false,
        };
    }

    render() {
        const { id, media_id, title, total_pages, cover_art, images, tags, publishedAt } = this.props.data;
        const { simple, japanese, english } = title;

        const mainTitle = simple || english || japanese;
        const thumbSizes = cover_art.sizes;
        const coverArtUrl = cover_art.url.split(".");
        const coverExts = coverArtUrl[coverArtUrl.length - 1];
        const ogThumb = `https://nh-web.vercel.app/dynimg.png?id=${media_id}.${coverExts}&title=${encodeURI(
            mainTitle
        )}`;

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
                    image={ogThumb}
                >
                    <div className="flex-1 overflow-x-hidden overflow-y-auto">
                        <ReaderComponent.Container>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                <div className="flex justify-center items-center">
                                    <Link href={`/read/${id}/1`} passHref>
                                        <a>
                                            <img
                                                className="object-cover h-[30rem] object-center"
                                                src={cover_art.url}
                                            />
                                        </a>
                                    </Link>
                                </div>
                                <div className="flex flex-col mt-4 lg:mt-0">
                                    <ReaderComponent.Title {...title} />
                                    <span
                                        className="flex flex-col mt-2 cursor-pointer"
                                        onClick={() => {
                                            navigator.clipboard.writeText(id);
                                        }}
                                    >
                                        <span className="font-mono text-gray-400 tracking-wide">
                                            {"#" + id}
                                        </span>
                                    </span>
                                    <div className="mt-2 flex flex-col">
                                        <ReaderComponent.TagGroup groupName="Parodies" tags={tags.parodies} />
                                        <ReaderComponent.TagGroup
                                            groupName="Characters"
                                            tags={tags.characters}
                                        />
                                        <ReaderComponent.TagGroup groupName="Tags" tags={tags.tags} />
                                        <ReaderComponent.TagGroup groupName="Artists" tags={tags.artists} />
                                        <ReaderComponent.TagGroup groupName="Groups" tags={tags.groups} />
                                        <ReaderComponent.TagGroup
                                            groupName="Languages"
                                            tags={tags.languages}
                                        />
                                        <ReaderComponent.TagGroup
                                            groupName="Categories"
                                            tags={tags.categories}
                                        />
                                        <span>
                                            <span className="font-semibold">Pages:</span>
                                            <ReaderComponent.Tag name={total_pages.toString()} />
                                        </span>
                                        <span className="gap-1 flex flex-row">
                                            <span className="font-semibold">Uploaded:</span>
                                            <ReactTimeago date={new Date(publishedAt)} />
                                        </span>
                                        <ReaderComponent.InfoFooter doujinId={id} />
                                    </div>
                                </div>
                            </div>
                        </ReaderComponent.Container>
                        <ReaderComponent.Container className="mt-4 mb-6">
                            <ReaderComponent.Thumbnail
                                doujinId={id}
                                images={images}
                                thumbnailSizes={thumbSizes}
                            />
                        </ReaderComponent.Container>
                    </div>
                </Layout>
            </>
        );
    }
}
