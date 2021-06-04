import { isNone, Nullable } from "./utils";

interface ExtendedError extends Error {
    response: Response;
    data: any;
}

export async function fetcher(...args: Parameters<typeof fetch>) {
    try {
        const response = await fetch(...args);
        const data = await response.json();
        if (response.ok) {
            return data;
        }

        const error = new Error(response.statusText) as ExtendedError;
        error.response = response;
        error.data = data;

        throw error;
    } catch (error) {
        if (!error.data) {
            error.data = { message: error.message };
        }
        throw error;
    }
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveDelayCrawlerPromises<T>(
    requests: Promise<T>[],
    delayPerRequest: number
): Promise<T>[] {
    const remapRequest = requests.map(async (prom, idx) => {
        await sleep(delayPerRequest * idx);
        const res = await prom;
        return res;
    });
    return remapRequest;
}

export async function imageFetchWithRetry(url: string, maxRetryCount: number = 3) {
    let retryCount = maxRetryCount;
    while (retryCount > 0) {
        let fetchImages: Nullable<Response>;
        try {
            fetchImages = await fetch(url);
        } catch (e) {
            console.error(`[Downloader] Failed to download image, retrying in 5s`);
            await sleep(5 * 1000);
        }
        if (isNone(fetchImages)) {
            retryCount--;
            continue;
        }
        const blobby = await fetchImages.blob();
        return blobby;
    }
    return undefined;
}
