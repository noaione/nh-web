import React from "react";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";

import ChartBarIcon from "@heroicons/react/solid/ChartBarIcon";

import Layout from "../components/Layout";
import ReaderContainer from "../components/Reader/Container";
import Listing from "../components/Listing";
import ListingNavigator from "../components/ListingNavigator";

import { nhSearchRawResult, nhSearchResult, RawGQLData } from "../lib/types";
import { isNone, walk } from "../lib/utils";
import { queryFetch } from "../lib/api";

const SearchQuerySchemas = `query nhSearch($page:Int) {
    nhentai {
        latest(page:$page) {
            results {
                id
                title {
                    simple
                    japanese
                    english
                }
                tags {
                    languages {
                        name
                    }
                }
                cover_art {
                    url
                }
            }
            pageInfo {
                current
                total
            }
        }
    }
}`;

interface SearchPropsResult {
    data: nhSearchResult;
}

export default class SearchPageResult extends React.Component<SearchPropsResult> {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            results,
            pageInfo: { current, total },
        } = this.props.data;

        return (
            <>
                <Head>
                    <title>Latest :: nhProxy</title>
                </Head>
                <Layout
                    title="Latest"
                    description={`Latest doujin on page ${current} of ${total}`}
                    mode="home"
                    urlPath="/"
                >
                    <div className="flex-1 overflow-x-hidden overflow-y-auto">
                        <ListingNavigator current={current} total={total} />
                        <ReaderContainer className="px-2 py-2 mt-4 mb-6 rounded">
                            <div className="flex flex-row font-bold text-xl justify-center items-center text-center gap-1 mb-6">
                                <ChartBarIcon className="h-7 text-[#ED2553] mt-0.5" />
                                New uploads
                            </div>
                            {results.length > 0 ? (
                                <Listing galleries={results} />
                            ) : (
                                <div className="text-center text-lg font-bold">No results found</div>
                            )}
                        </ReaderContainer>
                        <ListingNavigator current={current} total={total} />
                    </div>
                </Layout>
            </>
        );
    }
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
    const { page } = query;
    let selPage;
    if (Array.isArray(page)) {
        selPage = page[0];
    } else {
        selPage = page;
    }
    if (isNone(selPage)) {
        selPage = 1;
    }

    let pageNo = parseInt(selPage);
    if (isNaN(pageNo)) {
        pageNo = 1;
    }

    if (pageNo < 1) {
        pageNo = 1;
    }

    console.info("Fetching API...");
    const apiResult = await queryFetch<RawGQLData<nhSearchRawResult>>(SearchQuerySchemas, {
        page: pageNo,
    });

    const rawData = walk<nhSearchResult>(apiResult, "data.nhentai.latest");
    if (isNone(rawData)) {
        return {
            notFound: true,
        };
    }

    const { results, pageInfo } = rawData;

    return {
        props: {
            data: {
                results,
                pageInfo,
            },
        },
    };
}
