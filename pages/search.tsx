import React from "react";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";

import SearchIcon from "@heroicons/react/solid/SearchIcon";

import Layout from "../components/Layout";
import ReaderContainer from "../components/Reader/Container";
import Listing from "../components/Listing";
import ListingNavigator from "../components/ListingNavigator";

import { nhSearchRawResult, nhSearchResult, RawGQLData } from "../lib/types";
import { isNone, walk } from "../lib/utils";
import { queryFetch } from "../lib/api";

const SearchQuerySchemas = `query nhSearch($query:String!,$page:Int) {
    nhentai {
        search(query:$query,page:$page) {
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
                images {
                    url
                }
                cover_art {
                    url
                    sizes
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
            query,
            results,
            pageInfo: { current, total },
        } = this.props.data;

        const realTotal = total * 25;

        return (
            <>
                <Head>
                    <title>Search: {query} :: nhProxy</title>
                </Head>
                <Layout
                    title={`Search: ${query}`}
                    description={`Search result of ${query} (Found: ${total} hits)`}
                    mode="home"
                    urlPath="/search"
                    query={query}
                >
                    <div className="flex-1 overflow-x-hidden overflow-y-auto">
                        <div className="text-center text-2xl justify-center flex flex-row items-center gap-1 font-bold mb-4">
                            <SearchIcon className="h-8 mt-1 text-red-500" />
                            {realTotal.toLocaleString()} results
                        </div>
                        <ListingNavigator query={query} current={current} total={total} />
                        <ReaderContainer className="px-2 py-2 mt-4 mb-6 rounded">
                            {results.length > 0 ? (
                                <Listing galleries={results} />
                            ) : (
                                <div className="text-center text-lg font-bold">No results found</div>
                            )}
                        </ReaderContainer>
                        <ListingNavigator query={query} current={current} total={total} />
                    </div>
                </Layout>
            </>
        );
    }
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
    if (isNone(query)) {
        return {
            notFound: true,
        };
    }
    const { q, page } = query;
    if (typeof q !== "string") {
        return {
            notFound: true,
        };
    }

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
        query: q,
        page: pageNo,
    });

    const rawData = walk<nhSearchResult>(apiResult, "data.nhentai.search");
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
                query: q,
            },
        },
    };
}
