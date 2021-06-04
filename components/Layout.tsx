import Head from "next/head";
import React from "react";

import MetadataHead from "./MetadataHead";
import { SEOMetaProps } from "./MetadataHead/SEO";
import Navbar, { NavbarProps } from "./Navbar";

interface LayoutProps extends NavbarProps, SEOMetaProps {
    mainClassName?: string;
}

export default class Layout extends React.Component<LayoutProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { mainClassName } = this.props;
        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <MetadataHead.Prefetch />
                    <MetadataHead.SEO {...this.props} />
                </Head>
                <Navbar mode={this.props.mode} noSticky={this.props.noSticky} />
                <main
                    className={`antialiased h-full pb-4 mx-4 mt-4 ${
                        typeof mainClassName === "string" ? mainClassName : ""
                    }`}
                >
                    {this.props.children}
                </main>
            </>
        );
    }
}
