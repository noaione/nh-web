import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import { nhTitle } from "../../../lib/types";

interface Title {
    english: string;
    japanese: string;
    pretty: string;
}

interface Tag {
    id: number;
    count: number;
    name: string;
    type: string;
    url: string;
}

type ImageCode = "j" | "p" | "g";

interface Image {
    t: ImageCode;
    w: number;
    h: number;
}

interface Images {
    cover: Image;
    thumbnail: Image;
    pages: Image[];
}

interface APISearchResult {
    id: number;
    media_id: string;
    scanlator?: string;
    title: Title;
    upload_date: number;
    tags: Tag[];
    images: Images;
    num_favorites: number;
    num_pages: number;
}

interface ImageParsed {
    url: string;
    width: number;
    height: number;
}

interface RelatedResult {
    id: string;
    media_id: string;
    thumbnail: ImageParsed;
    title: nhTitle;
}

function MapToExt(t: ImageCode) {
    switch (t) {
        case "g":
            return "gif";
        case "j":
            return "jpg";
        case "p":
            return "png";
        default:
            return null;
    }
}

function remapRelatedResult(results: APISearchResult[]) {
    if (!Array.isArray(results)) {
        return [];
    }
    const fullRemapped: RelatedResult[] = [];
    results.forEach((e) => {
        const {
            images: { cover },
        } = e;
        const thumbUrl = `https://nh.ihateani.me/booba/t/${e.media_id}/cover.${MapToExt(cover.t)}`;
        const remapped: RelatedResult = {
            id: e.id.toString(),
            media_id: e.media_id,
            title: {
                english: e.title.english || null,
                japanese: e.title.japanese || null,
                simple: e.title.pretty,
            },
            thumbnail: {
                url: thumbUrl,
                width: cover.w,
                height: cover.h,
            },
        };
        fullRemapped.push(remapped);
    });
    return fullRemapped;
}

export default async function RelatedDoujinAPI(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    try {
        const apiRes = await axios.get(`https://nhentai.net/api/gallery/${id as string}/related`, {
            responseType: "json",
        });
        if (apiRes.status >= 400) {
            res.status(apiRes.status).json({ success: false, related: [] });
        }
        res.json({ success: true, related: remapRelatedResult(apiRes.data?.result || []) });
    } catch (e) {
        console.error(e);
        if (e.response) {
            const apiRes: AxiosResponse = e.response;
            res.status(apiRes.status).json({ success: false, related: [] });
        } else {
            res.status(500).json({ success: false, related: [] });
        }
    }
}
