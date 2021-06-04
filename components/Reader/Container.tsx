import React from "react";

function isString(data: any): data is string {
    return typeof data === "string";
}

export default function ReaderContainer(
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) {
    const { children, className, ...rest } = props;

    return (
        <div
            {...rest}
            className={`container mx-auto px-6 py-6 bg-gray-700 ${isString(className) ? className : ""}`}
        >
            {children}
        </div>
    );
}
