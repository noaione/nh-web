import axios, { AxiosResponse } from "axios";
import { IncomingMessage } from "http";
import { lookup as lookupExtension } from "mime-types";
import { NextApiRequest, NextApiResponse } from "next";

const URLMapping = {
    t: "https://t.nhentai.net/galleries/",
    thumb: "https://t.nhentai.net/galleries/",
    thumbnail: "https://t.nhentai.net/galleries/",
    i: "https://i.nhentai.net/galleries/",
    img: "https://i.nhentai.net/galleries/",
    image: "https://i.nhentai.net/galleries/",
    a: "https://i.nhentai.net/avatars/",
    ava: "https://i.nhentai.net/avatars/",
    avatar: "https://i.nhentai.net/avatars/",
};

async function getImageBin(url: string, res: NextApiResponse) {
    const splittedUrl = url.split(".");
    const realExtension = splittedUrl.slice(splittedUrl.length - 1, splittedUrl.length)[0];
    const mimeTypes = lookupExtension(realExtension);
    if (!mimeTypes) {
        res.status(204).end();
        return;
    }
    if (!mimeTypes.startsWith("image")) {
        res.status(204).end();
        return;
    }

    try {
        const response = await axios.get<IncomingMessage>(url, {
            responseType: "stream",
        });
        res.status(200);
        res.setHeader("Content-Type", mimeTypes);
        res.setHeader("Cache-Control", `public, immutable, no-transform, s-maxage=25200, max-age=25200`);
        response.data.pipe(res);
    } catch (e) {
        if (e.response) {
            const response = e.response as AxiosResponse;
            res.status(response.status).send(response.statusText);
        } else {
            console.error("An error occured, sadge...");
            res.status(500).send("Error occured");
        }
    }
}

export default async function ImagesProxier(req: NextApiRequest, res: NextApiResponse) {
    const { type, path } = req.query;
    if (!Array.isArray(path)) {
        return res.status(400).send("Incomplete path");
    }
    if (path.length < 1) {
        return res.status(400).send("Incomplete path");
    }
    let realType: string;
    if (Array.isArray(type)) {
        realType = type[0];
    } else if (typeof type === "string") {
        realType = type;
    } else {
        realType = "unknown";
    }
    const imagePath = path.join("/");
    const prefixPath = URLMapping[realType] as string | undefined;
    if (typeof prefixPath === "undefined") {
        return res.status(400).send("Incomplete or Unknown path");
    }
    getImageBin(`${prefixPath}${imagePath}`, res);
}
