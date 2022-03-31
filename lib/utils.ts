export type Nullable<T> = T | null;
export type NoneType = null | undefined;
export type NoneAble<T> = T | NoneType;
export type JSTypeof =
    | "string"
    | "function"
    | "bigint"
    | "number"
    | "boolean"
    | "undefined"
    | "object"
    | "symbol"
    | "array"; // Extra addition

/**
 * Check if value is a undefined or null
 * @param value the value to be checked
 * @returns is the value a nonetype or not
 */
export function isNone(value: any): value is NoneType {
    return typeof value === "undefined" || value === null;
}

/**
 * Convert a string/number to a number using fallback if it's NaN (Not a number).
 * If fallback is not specified, it will return to_convert.
 * @param cb parseFloat or parseInt function that will be run
 * @param to_convert number or string to convert
 * @param fallback fallback number
 */
export function fallbackNaN<F extends Function, T, S>(cb: F, to_convert: T, fallback?: S): T | S {
    if (Number.isNaN(cb(to_convert))) {
        return isNone(fallback) ? to_convert : fallback;
    }
    return cb(to_convert);
}

/**
 * Map a string or anything into a boolean
 * @param input_data the input to be mapped
 * @returns the boolean result
 */
export function mapBoolean<T>(input_data: T): boolean {
    if (isNone(input_data)) {
        return false;
    }
    let fstat = false;
    let data: any;
    if (typeof input_data === "string") {
        data = input_data.toLowerCase() as string;
    } else if (typeof input_data === "number") {
        data = input_data.toString().toLowerCase() as string;
    } else if (typeof input_data === "object") {
        data = JSON.stringify(input_data);
    } else {
        // @ts-ignore
        data = input_data.toString().toLowerCase();
    }
    switch (data) {
        case "y":
            fstat = true;
            break;
        case "enable":
            fstat = true;
            break;
        case "true":
            fstat = true;
            break;
        case "1":
            fstat = true;
            break;
        case "yes":
            fstat = true;
            break;
        default:
            break;
    }
    return fstat;
}

export function walk<Output>(data: any, note: string): Nullable<Output> {
    const nots = note.split(".");
    for (let i = 0; i < nots.length; i++) {
        if (isNone(data)) {
            break;
        }
        const n = nots[i];
        data = data[n];
    }
    // @ts-ignore
    return data;
}

export function pickFirstLine(textdata: string) {
    if (typeof textdata !== "string") {
        return textdata;
    }
    const extractedLines = textdata.split("\n");
    if (extractedLines.length < 1) {
        return textdata;
    }
    return extractedLines[0];
}

export function abbreviateNumber(value: number): string {
    let newValue: string = value.toString();
    if (value >= 1000) {
        const suffixes = ["", "k", "m", "b", "t"];
        const suffixNum = Math.floor(("" + value).length / 3);
        let shortValue;
        for (let precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat(
                (suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision)
            );
            const dotLessShortValue = (shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "");
            if (dotLessShortValue.length <= 2) {
                break;
            }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

export function selectFirst(argument: string | string[]) {
    if (isNone(argument)) {
        return "";
    }
    if (typeof argument === "string") {
        return argument;
    }
    return argument[0];
}
