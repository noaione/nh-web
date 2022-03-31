import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import ReactTimeago from "react-timeago";

import ReaderContainer from "./Container";

interface AuthorData {
    avaId?: string;
    username: string;
    perks: number;
}

interface CommentData {
    id: string;
    content: string;
    timestamp: number;
    author: AuthorData;
}

function AvatarLoader(props: { url: string }) {
    const { url } = props;
    const { ref, inView } = useInView({
        triggerOnce: true,
    });
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errored, setError] = useState(false);
    const isBlank = url.includes("/blank.png");

    useEffect(() => {
        if (!mounted) {
            setMounted(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (inView && loading) {
            if (isBlank) {
                setLoading(false);
            } else {
                fetch(props.url)
                    .then((res) => {
                        if (res.status !== 200) {
                            setError(true);
                        }
                        setLoading(false);
                    })
                    .catch(() => {
                        setError(true);
                        setLoading(false);
                    });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    return (
        <div className="flex" ref={ref}>
            {mounted && loading && (
                <span className="rounded-full w-[3.25rem] h-[3.25rem] animate-pulse bg-gray-700" />
            )}
            {mounted && !loading && (
                <>
                    {isBlank || errored ? (
                        <span className="rounded-full w-[3.25rem] h-[3.25rem] bg-gray-700" />
                    ) : (
                        <img
                            src={props.url}
                            className="rounded-full w-[3.25rem] h-[3.25rem] object-cover object-center"
                            alt="Avatar"
                        />
                    )}
                </>
            )}
        </div>
    );
}

function ReaderComment(props: CommentData) {
    const {
        author: { username, avaId },
        content,
        timestamp,
    } = props;
    const realAvatar = avaId === null ? "/booba/a/blank.png" : `/booba/a/${avaId}`;

    return (
        <div className="w-full flex flex-row gap-2 items-center">
            <AvatarLoader url={realAvatar} />
            <div className="flex flex-col align-top items-start gap-1 text-sm leading-5">
                <div className="flex flex-row gap-2">
                    <span className="font-bold text-white">{username}</span>
                    <div className="text-gray-400 font-medium">
                        <ReactTimeago date={new Date(timestamp * 1000)} />
                    </div>
                </div>
                <div className="flex flex-col text-sm leading-5 break-words">{content}</div>
            </div>
        </div>
    );
}

interface SectionProps {
    doujinId: string;
}

export default function ReaderCommentsSection(props: SectionProps) {
    const { doujinId } = props;
    const { ref, inView } = useInView({
        triggerOnce: true,
    });
    const [comments, setComments] = useState<CommentData[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!mounted) {
            setMounted(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (inView && !loading) {
            setLoading(true);
            fetch(`/api/comments/${doujinId}`)
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
                    setComments(res.comments);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
            setTimeout(() => {
                setLoading(false);
            }, 2500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    return (
        <ReaderContainer>
            <div ref={ref} className="flex flex-col gap-4">
                {loading && (
                    <h2 className="font-bold text-lg text-center animate-pulse">Loading comments...</h2>
                )}
                {mounted && !loading && (
                    <>
                        {comments.length > 0 ? (
                            comments.map((comment) => {
                                return (
                                    <ReaderComment key={`comment-${doujinId}-${comment.id}`} {...comment} />
                                );
                            })
                        ) : (
                            <h2 className="font-bold text-lg text-center animate-pulse">No comment</h2>
                        )}
                    </>
                )}
            </div>
        </ReaderContainer>
    );
}
