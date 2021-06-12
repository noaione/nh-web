import React from "react";
import { pickFirstLine } from "../../lib/utils";

import OpenGraphMeta from "./OpenGraph";
import TwitterCardsMeta from "./TwitterCard";

function isString(data: any): data is string {
    return typeof data === "string";
}

export interface SEOMetaProps {
    title?: string;
    description?: string;
    image?: string;
    urlPath?: string;
}

class SEOMetaTags extends React.Component<SEOMetaProps> {
    constructor(props: SEOMetaProps) {
        super(props);
    }

    render() {
        const { title, description, image, urlPath } = this.props;

        let realTitle = "Home";
        let realDescription = "A Frontend for ihateani.me NH API";
        let realImage = "/images/social-card.png";
        let realUrl = null;
        if (isString(title)) {
            realTitle = title;
        }
        if (isString(description)) {
            realDescription = description;
        }
        if (isString(image)) {
            realImage = image;
        }
        if (isString(urlPath)) {
            realUrl = urlPath;
        }

        let url = "https://nh.ihateani.me";
        if (isString(urlPath)) {
            if (urlPath.startsWith("/")) {
                url += realUrl;
            } else {
                url += "/" + realUrl;
            }
        }

        return (
            <>
                {realDescription && <meta name="description" content={pickFirstLine(realDescription)} />}
                <OpenGraphMeta title={realTitle} description={realDescription} url={url} image={realImage} />
                <TwitterCardsMeta title={realTitle} description={realDescription} image={realImage} />
            </>
        );
    }
}

export default SEOMetaTags;
