/**
 * Copied directly from the ihaapi schemas
 */

export interface nhTitle {
    simple: string;
    english: string;
    japanese?: string;
}

export interface nhTag {
    name: string;
    amount?: number;
}

export interface nhImage {
    type: string;
    url: string;
    original_url: string;
    sizes?: number[];
}

export interface nhTags {
    artists?: nhTag[];
    categories?: nhTag[];
    groups?: nhTag[];
    languages?: nhTag[];
    tags?: nhTag[];
    parodies?: nhTag[];
    characters?: nhTag[];
}

export interface nhInfoResult {
    id: string;
    media_id: string;
    title: nhTitle;
    cover_art: nhImage;
    tags: nhTags;
    images: nhImage[];
    url: string;
    publishedAt: string;
    favorites?: number;
    total_pages: number;
}

export interface nhPageInfo {
    current: number;
    total: number;
}

export interface nhSearchResult {
    query?: string;
    results?: nhInfoResult[];
    pageInfo: nhPageInfo;
}

export interface nhSearchRawResult {
    search: nhSearchResult;
}

export interface nhInfoRawResult {
    info: nhInfoRawResult;
}

export interface nhLatestRawResult {
    latest: nhSearchResult;
}

export interface RawGQLData<T> {
    data?: {
        nhentai?: T;
    };
    errors?: any[];
}
