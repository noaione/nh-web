import { sortBy } from "lodash";
import Router from "next/router";
import React, { PropsWithChildren } from "react";

import { abbreviateNumber, isNone } from "../../lib/utils";

export interface ITag {
    name: string;
    amount?: number;
}

type ITagExtend = ITag & { mode?: string };

function validTag(tags: any) {
    if (Array.isArray(tags) && tags.length > 0) {
        return true;
    }
    return false;
}

export function Tag({ name, amount, mode }: ITagExtend) {
    const navigateSearchMode = () => {
        if (isNone(mode)) {
            return;
        }
        const tagMode = mode.toLowerCase();
        const joinedSearchParams = `${tagMode}:"${name}"`;
        Router.push(
            {
                pathname: "/search",
                query: {
                    q: joinedSearchParams,
                },
            },
            null,
            { shallow: false }
        );
    };

    const extraStyles = isNone(mode) ? "" : "hover:brightness-110";

    const Container = ({ children }: PropsWithChildren<any>) => {
        if (isNone(mode)) {
            return (
                <span
                    className={`inline-flex flex-row m-1 justify-center align-middle text-white text-sm select-none ${extraStyles}`}
                >
                    {children}
                </span>
            );
        }
        let finalUrl = "/search";
        const tagName = `${mode.toLowerCase()}:"${name}"`;
        finalUrl += "?q=" + encodeURIComponent(tagName);
        return (
            <a
                href={finalUrl}
                className={`inline-flex flex-row m-1 justify-center align-middle text-white text-sm select-none ${extraStyles}`}
                onClick={(e) => {
                    e.preventDefault();
                    navigateSearchMode();
                }}
            >
                {children}
            </a>
        );
    };

    return (
        <Container>
            <span
                className={`font-bold bg-gray-500 text-gray-100 flex py-[.13rem] px-[.39rem] items-center ${
                    amount ? "rounded-l" : "rounded"
                }`}
            >
                {name}
            </span>
            {amount && (
                <span className="font-normal bg-gray-600 text-gray-400 flex py-[.13rem] px-[.39rem] items-center rounded-r">
                    {abbreviateNumber(amount)}
                </span>
            )}
        </Container>
    );
}

export default function TagGroup({ groupName, tags }: { groupName: string; tags: ITag[] }) {
    if (!validTag(tags)) {
        return null;
    }

    return (
        <span>
            <span className="font-semibold">{groupName}:</span>
            {sortBy(tags, (o) => o.amount)
                .reverse()
                .map((res) => {
                    return (
                        <Tag
                            key={`tag-${groupName}-${res.name}`}
                            name={res.name}
                            amount={res.amount ?? 0}
                            mode={groupName}
                        />
                    );
                })}
        </span>
    );
}
