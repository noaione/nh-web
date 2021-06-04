import { sortBy } from "lodash";
import React from "react";

import { abbreviateNumber } from "../../lib/utils";

export interface ITag {
    name: string;
    amount?: number;
}

function validTag(tags: any) {
    if (Array.isArray(tags) && tags.length > 0) {
        return true;
    }
    return false;
}

export function Tag({ name, amount }: ITag) {
    return (
        <span className="inline-flex flex-row m-1 justify-center align-middle text-white text-sm select-none">
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
        </span>
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
                        <Tag key={`tag-${groupName}-${res.name}`} name={res.name} amount={res.amount ?? 0} />
                    );
                })}
        </span>
    );
}
