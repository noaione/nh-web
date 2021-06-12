import { readFileSync } from "fs";
import { TemplatingProps } from "./types";

const bold = readFileSync(`${process.cwd()}/pages/api/_fonts/Roboto-Bold.ttf`).toString("base64");

function getCss() {
    return `
    @font-face {
        font-family: 'Roboto';
        font-style:  normal;
        font-weight: bold;
        src: url(data:font/woff2;charset=utf-8;base64,${bold}) format('ttf');
    }

    body {
        background-color: #223445;
    }

    html {
        width: 100%;
        height: 100vh;
    }

    .flex {
        display: flex;
    }

    .flex-row {
        flex-direction: row;
    }

    .flex-col {
        flex-direction: column;
    }

    .main-content {
        vertical-align: middle;
        /* margin-top: 50%; */
        /* margin-bottom: 50%; */
    }

    .img-pad {
        margin-top: 50px;
        margin-bottom: 50px;
        margin-left: 50px;
        border-radius: 10px;
    }

    .pad-auto {
        margin-top: auto;
        margin-bottom: auto;
        justify-items: center
    }

    .center {
        align-items: center;
    }

    .text-data {
        margin-top: 50px;
        margin-bottom: 50px;
        margin-left: 20px;
        color: white;
        font-family: 'Roboto';
        font-weight: 700;
    }

    .shadow-text-5 {
        text-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
    }

    .shadow-text-3 {
        text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.3);
    }

    .text-extra {
        font-size: 16pt;
        margin-top: 4px;
        margin-bottom: 4px;
    }

    .hidden {
        display: none;
    }`;
}

function isNumber(value: any): value is number {
    return typeof value === "number";
}

export function getHtml(props: TemplatingProps) {
    return `<!DOCTYPE html>
<html>

<head>
    <style>
        ${getCss()}
    </style>
    <body class="flex">
    <div class="pad-auto">
        <div class="flex flex-row">
            <img class="img-pad" src="${props.image}" width="${props.width}" height="${props.height}">
            <div class="flex flex-col text-data">
                <h2 style="font-size: 38pt;margin:0">
                    <span class="shadow-text-5">${props.title}</span>
                </h2>
                <p class="text-extra shadow-text-3 ${isNumber(props.page) ? "" : "hidden"}">Page ${
        props.page || 1
    }</p>
                <p class="text-extra shadow-text-3">${
                    props.downloadMode ? "Download" : "Read"
                } now on nh.ihateani.me!</p>
                <img class="shadow-text-5" src="https://nh-web.vercel.app/images/logo.svg" width="150" height="150" />
            </div>
        </div>
    </div>
</body>
</html>
    `;
}
