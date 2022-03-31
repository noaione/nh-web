import { fetcher } from "./fetcher";

export async function queryFetch<T>(
    gqlSchemas: string,
    variables: any,
    noCache: boolean = false
): Promise<T> {
    const apiRes = await fetcher(`https://api.ihateani.me/v2/graphql${noCache ? "?nocache=1" : ""}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: gqlSchemas,
            variables: variables,
        }),
    });
    return apiRes;
}
