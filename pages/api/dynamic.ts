import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import mime from "mime-types";

import axios from "axios";
import nodecanvas from "canvas";

const processCWD = process.cwd();

nodecanvas.registerFont(path.join(processCWD, "public", "fonts", "Roboto-Bold.ttf"), {
    family: "Roboto",
    weight: "700",
});

async function getBase64(url: string, mime: string) {
    try {
        const resp = await axios.get(url, { responseType: "arraybuffer" });
        const bufferData = Buffer.from(resp.data, "binary").toString("base64");
        return `data:${mime};base64,${bufferData}`;
    } catch (e) {
        return undefined;
    }
}

function resizeHeight(targetWidth: number, sourceWidth: number, sourceHeight: number) {
    return (sourceHeight / sourceWidth) * targetWidth;
}

function resizeWidth(targetHeight: number, sourceWidth: number, sourceHeight: number) {
    return (sourceWidth / sourceHeight) * targetHeight;
}

export default async function DynamicImageGenerator(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req;

    const { id, page, title, type } = query;

    if (typeof id !== "string" || typeof title !== "string") {
        return res.status(404).redirect("/images/social-card.png");
    }

    const splitAtDot = id.split(".");
    if (splitAtDot.length !== 2) {
        return res.status(404).redirect("/images/social-card.png");
    }
    const [mediaId, ext] = splitAtDot;
    const mimeTypes = mime.lookup(ext);
    if (!mimeTypes) {
        return res.status(404).redirect("/images/social-card.png");
    }
    if (!mimeTypes.startsWith("image")) {
        return res.status(404).redirect("/images/social-card.png");
    }

    let imgUrl = `https://t.nhentai.net/galleries/${mediaId}/cover.${ext}`;
    let validPage = false;
    if (typeof page === "string") {
        const parseO = parseInt(page);
        if (!isNaN(parseO)) {
            validPage = true;
            imgUrl = `https://t.nhentai.net/galleries/${mediaId}/${parseO}t.${ext}`;
        }
    }

    const base64Image = await getBase64(imgUrl, mimeTypes);
    if (typeof base64Image !== "string") {
        return res.status(404).redirect("/images/social-card.png");
    }

    const logo = new nodecanvas.Image();
    const base64Logo = await getBase64(
        "https://nh-web.vercel.app/images/logo.svg",
        mime.lookup(".svg") as string
    );
    if (typeof base64Logo !== "string") {
        return res.status(404).redirect("/images/social-card.png");
    }
    logo.src = base64Logo;

    const imageThumb = new nodecanvas.Image();
    imageThumb.src = base64Image;
    // Set the max width for the image
    if (imageThumb.width > 600) {
        imageThumb.height = resizeHeight(600, imageThumb.width, imageThumb.height);
        imageThumb.width = 600;
    }
    if (imageThumb.height > 600) {
        imageThumb.width = resizeWidth(600, imageThumb.width, imageThumb.height);
        imageThumb.height = 600;
    }
    const canvas = nodecanvas.createCanvas(1280, 720);
    const ctx = canvas.getContext("2d");

    function wrapText(fullText: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = fullText.split(" ");
        let line = "";
        words.forEach((word, n) => {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = word + " ";
                y += lineHeight;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, x, y);
        return y;
    }

    function roundedImage(
        image: nodecanvas.Image,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number = 10
    ) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#223445";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const heightPath = canvas.height / 2 - imageThumb.height / 2;
    const startTitlePath = 50 + imageThumb.width + 20;
    const maxWidth = canvas.width - startTitlePath - 50;
    roundedImage(imageThumb, 50, heightPath, imageThumb.width, imageThumb.height, 10);

    ctx.font = "40pt Roboto";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;
    const finalY = wrapText(title, startTitlePath, heightPath + 48, maxWidth, 58);
    ctx.font = "16pt Roboto";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;

    const addExtra = validPage ? 32 : 0;

    const preText = type === "down" ? "Download" : "Read";
    if (validPage) {
        ctx.fillText(`Page ${page}`, startTitlePath, finalY + 38);
    }

    ctx.fillText(`${preText} now on nh.ihateani.me!`, startTitlePath, finalY + addExtra + 38);
    ctx.drawImage(logo, startTitlePath, finalY + addExtra + 30, 150, 150);

    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
}
