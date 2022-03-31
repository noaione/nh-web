import React from "react";
import Head from "next/head";
import Router from "next/router";
import { GetServerSidePropsContext } from "next";

import SearchIcon from "@heroicons/react/solid/SearchIcon";

import Layout from "../components/Layout";
import ReaderContainer from "../components/Reader/Container";
import Listing from "../components/Listing";
import ListingNavigator from "../components/ListingNavigator";

import { nhSearchWebRawResult, nhSearchWebResult, RawGQLData } from "../lib/types";
import { isNone, selectFirst, walk } from "../lib/utils";
import { queryFetch } from "../lib/api";

const SearchQuerySchemas = `query nhSearch($query:String!,$page:Int,$mode:nHentaiSearchMode) {
    nhentai {
        searchweb(query:$query,page:$page,mode:$mode) {
            results {
                id
                title
                cover_art {
                    url
                    sizes
                }
                language
            }
            pageInfo {
                current
                total
            }
        }
    }
}`;

function mapLanguage(language: string) {
    const defaultLanguage = "JP";
    const languageMaps = {
        japanese: "JP",
        chinese: "CN",
        english: "GB",
        korean: "KR",
    };
    return languageMaps[language] || defaultLanguage;
}

type SearchMode = "RECENT" | "POPULAR_ALL" | "POPULAR_WEEK" | "POPULAR_TODAY";

interface SearchPropsResult {
    data: nhSearchWebResult & { mode: SearchMode };
}

function mapSearchModeToQuery(mode: SearchMode) {
    switch (mode) {
        case "RECENT":
            return "recent";
        case "POPULAR_ALL":
            return "popular";
        case "POPULAR_WEEK":
            return "popular-week";
        case "POPULAR_TODAY":
            return "popular-today";
        default:
            return "recent";
    }
}

export default class SearchPageResult extends React.Component<SearchPropsResult> {
    constructor(props) {
        super(props);
    }

    navigateMode(targetMode: SearchMode) {
        if (targetMode === this.props.data.mode) {
            return;
        }
        const pathname = Router.pathname;
        const currentQuery = Router.query;
        currentQuery.sort = mapSearchModeToQuery(targetMode);
        // delete the sort query if target mode is RECENT
        if (targetMode === "RECENT") {
            try {
                delete currentQuery.sort;
            } catch {}
        }
        console.info(`Navigating to ${pathname}`);
        Router.push({ pathname, query: currentQuery }, null, { shallow: false });
    }

    render() {
        const {
            query,
            results,
            pageInfo: { current, total },
            mode,
        } = this.props.data;

        const realTotal = total * 25;

        let prependText = "Search:";
        switch (mode) {
            case "POPULAR_ALL":
                prependText = "Search (Popular):";
                break;
            case "POPULAR_WEEK":
                prependText = "Search (Week):";
                break;
            case "POPULAR_TODAY":
                prependText = "Search (Day):";
                break;
            default:
                break;
        }

        const remappedResults = results.map((result) => {
            const actualLanguage = mapLanguage(result.language);
            return {
                id: result.id,
                title: result.title,
                cover_art: result.cover_art,
                language: actualLanguage,
            };
        });

        const isRecent = mode === "RECENT";
        const isToday = mode === "POPULAR_TODAY";
        const isWeek = mode === "POPULAR_WEEK";
        const isAll = mode === "POPULAR_ALL";

        return (
            <>
                <Head>
                    <title>
                        {prependText} {query} :: nhProxy
                    </title>
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
                        <div className="text-center text-xl justify-center flex flex-row items-center gap-1 font-bold mb-4">
                            <div className="flex flex-row mx-2">
                                <div
                                    className={`${
                                        isRecent ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                                    } p-2 rounded-md cursor-pointer`}
                                    onClick={() => this.navigateMode("RECENT")}
                                >
                                    Recent
                                </div>
                            </div>
                            <div className="flex flex-row mx-2 gap-0.5">
                                <div className="bg-gray-800 p-2 rounded-l-md">Popular:</div>
                                <div
                                    className={`${
                                        isToday ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                                    } p-2 cursor-pointer`}
                                    onClick={() => this.navigateMode("POPULAR_TODAY")}
                                >
                                    today
                                </div>
                                <div
                                    className={`${
                                        isWeek ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                                    } p-2 cursor-pointer`}
                                    onClick={() => this.navigateMode("POPULAR_WEEK")}
                                >
                                    week
                                </div>
                                <div
                                    className={`${
                                        isAll ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                                    } p-2 rounded-r-md cursor-pointer`}
                                    onClick={() => this.navigateMode("POPULAR_ALL")}
                                >
                                    all time
                                </div>
                            </div>
                        </div>
                        <ListingNavigator query={query} current={current} total={total} />
                        <ReaderContainer className="px-2 py-2 mt-4 mb-6 rounded">
                            {results.length > 0 ? (
                                <Listing galleries={remappedResults} />
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

function determineSortMode(sortMode: string) {
    sortMode = sortMode.toLowerCase();
    // replace all underscore with hypen
    sortMode = sortMode.replace(/_/g, "-");
    if (["popular", "all", "popular-all", "all-time", "popular-all-time"].includes(sortMode)) {
        return "POPULAR_ALL";
    }
    if (["popular-week", "week", "weeks"].includes(sortMode)) {
        return "POPULAR_WEEK";
    }
    if (["popular-day", "popular-today", "today", "day", "days"].includes(sortMode)) {
        return "POPULAR_TODAY";
    }
    return "RECENT";
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
    if (isNone(query)) {
        return {
            notFound: true,
        };
    }
    const { q, page, sort } = query;
    if (typeof q !== "string") {
        return {
            notFound: true,
        };
    }
    const sortString = selectFirst(sort).toLowerCase();
    const sortMode = determineSortMode(sortString);

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
    const apiResult = await queryFetch<RawGQLData<nhSearchWebRawResult>>(SearchQuerySchemas, {
        query: q,
        page: pageNo,
        mode: sortMode,
    });

    const rawData = walk<nhSearchWebResult>(apiResult, "data.nhentai.searchweb");
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
                mode: sortMode,
            },
        },
    };
}
