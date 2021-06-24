import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

interface Poster {
    id: number;
    slug: string;
    username: string;
    avatar_url: string;
    is_staff: boolean;
    is_superuser: boolean;
}
interface CommentBody {
    id: number;
    gallery_id: number;
    post_date: number;
    body: string;
    poster: Poster;
}

interface PosterParsed {
    avaId?: string;
    username: string;
    perks: number;
}

interface ReparsedComment {
    id: string;
    content: string;
    timestamp: number;
    author: PosterParsed;
}

function getPathFromUrl(url: string) {
    return url.split("?")[0];
}

function reparseCommentData(comments: CommentBody[]) {
    if (!Array.isArray(comments)) {
        return [];
    }
    const reparsed: ReparsedComment[] = [];
    comments.forEach((co) => {
        let perks = 0;
        const {
            poster: { id, is_staff, is_superuser, avatar_url, username },
        } = co;
        if (is_staff && is_superuser) {
            perks = 3;
        } else if (is_staff) {
            perks = 2;
        } else if (is_superuser) {
            perks = 1;
        }
        const splitted = avatar_url.split(".");
        const extension = getPathFromUrl(splitted[splitted.length - 1]);
        let avaId = `${id}.${extension}`;
        if (avatar_url.includes("avatars/blank")) {
            avaId = null;
        }
        reparsed.push({
            id: co.id.toString(),
            content: co.body,
            timestamp: co.post_date,
            author: {
                username,
                avaId,
                perks,
            },
        });
    });
    return reparsed;
}

export default async function CommentsAPI(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    try {
        const apiRes = await axios.get(`https://nhentai.net/api/gallery/${id as string}/comments`, {
            responseType: "json",
        });
        if (apiRes.status >= 400) {
            res.status(apiRes.status).json({ success: false, comments: [] });
        }
        res.json({ success: true, comments: reparseCommentData(apiRes.data || []) });
    } catch (e) {
        console.error(e);
        if (e.response) {
            const apiRes: AxiosResponse = e.response;
            res.status(apiRes.status).json({ success: false, comments: [] });
        } else {
            res.status(500).json({ success: false, comments: [] });
        }
    }
}
