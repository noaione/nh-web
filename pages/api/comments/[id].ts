import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function CommentsAPI(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    try {
        const apiRes = await axios.get(`https://nhentai.net/api/gallery/${id as string}/comments`, {
            responseType: "json",
        });
        if (apiRes.status >= 400) {
            res.status(apiRes.status).json({ success: false, comments: [] });
        }
        res.json({ success: true, comments: apiRes.data });
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
