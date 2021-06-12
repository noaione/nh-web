import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";

import { useRouter } from "next/router";

import Layout from "../components/Layout";
import ReaderContainer from "../components/Reader/Container";

import { selectEmotes } from "../lib/randomemote";

export default function NotFoundPage() {
    const router = useRouter();
    const [hash, setHash] = useState(router.asPath);

    const [Emotes, emoteIndex] = selectEmotes();
    useEffect(() => {
        const hashThis = { emote: emoteIndex, path: router.asPath, stamp: new Date().getTime(), type: "500" };
        setHash(btoa(JSON.stringify(hashThis)));
    }, []);

    return (
        <>
            <Head>
                <title>500 :: nhProxy</title>
            </Head>
            <Layout title="Page not Found" description="The page you're trying to access cannot be found.">
                <div className="flex-1 overflow-x-hidden overflow-y-auto">
                    <ReaderContainer>
                        <div
                            className="flex flex-row justify-center mt-2 gap-0.5"
                            aria-label="500 Page Emote"
                        >
                            {Emotes.map((emote) => {
                                return (
                                    <Image
                                        key={`errpage-emote-${emote.name}`}
                                        src={`/images/yeahbutBTTVislikea3rdpartything/${emote.file}`}
                                        width={emote.w}
                                        height={emote.h}
                                        alt={emote.name}
                                        title={emote.name}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-center text-4xl justify-center font-bold mt-4">
                            An Internal Error has occured
                        </div>
                        <p className="text-center mt-4">
                            Uh oh, looks like the server exploded or something, please try again later.
                        </p>
                        <div className="justify-center items-center mt-1 flex-wrap flex flex-col lg:flex-row">
                            <span className="mr-1 mb-1 lg:mb-0">Codex Entry:</span>
                            <pre
                                className="p-1 text-center bg-gray-800 border-red-700 border rounded-md bg-opacity-60 border-opacity-70 whitespace-pre-wrap break-all"
                                onClick={(ev) => {
                                    if (window.getSelection && document.createRange) {
                                        const range = document.createRange();
                                        range.selectNodeContents(ev.currentTarget);
                                        const sel = window.getSelection();
                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                        // @ts-ignore
                                    } else if (document.body && document.body.createTextRange) {
                                        // @ts-ignore
                                        const range = document.body.createTextRange();
                                        range.moveToElementText(ev.currentTarget);
                                        range.select();
                                    }
                                }}
                            >
                                {hash}
                            </pre>
                        </div>
                    </ReaderContainer>
                </div>
            </Layout>
        </>
    );
}
