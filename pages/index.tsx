import React from "react";
import Head from "next/head";

import Layout from "../components/Layout";

interface SearchPropsResult {
    data: any[];
}

export default class HomepageSearch extends React.Component<SearchPropsResult> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <Head>
                    <title>Home :: nhProxy</title>
                </Head>
                <Layout title="Home" description="A simple nHentai Proxy website" mode="home" urlPath="/">
                    <div className="flex flex-col w-full">
                        <p>Hello!</p>
                    </div>
                </Layout>
            </>
        );
    }
}
