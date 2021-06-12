interface EmoteSet {
    name: string;
    file: string;
    w: number;
    h: number;
}

function getRandRange(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
}

const EMOTESETS: EmoteSet[][] = [
    [
        {
            name: "pepeMeltdown",
            file: "pepeMeltdown.gif",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "Sadge",
            file: "Sadge.png",
            w: 112,
            h: 112,
        },
        {
            name: "GuitarTime",
            file: "GuitarTime.gif",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "FeelsRainMan",
            file: "FeelsRainMan.gif",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "WAYTOODANK",
            file: "WAYTOODANK.gif",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "monkaW",
            file: "monkaW.png",
            w: 112,
            h: 112,
        },
        {
            name: "PKnife",
            file: "PKnife.png",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "PepoG",
            file: "PepoG.png",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "peepoLeave",
            file: "peepoLeave.gif",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "HACKERMANS",
            file: "HACKERMANS.gif",
            w: 112,
            h: 112,
        },
    ],
    [
        {
            name: "xqcL",
            file: "xqcL.png",
            w: 102,
            h: 128,
        },
    ],
];

export function selectEmotes(): [EmoteSet[], number] {
    let selected = getRandRange(0, EMOTESETS.length) - 1;
    if (selected < 0) {
        selected = 0;
    } else if (selected >= EMOTESETS.length) {
        selected = EMOTESETS.length - 1;
    }

    return [EMOTESETS[selected], selected];
}
