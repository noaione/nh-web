import React from "react";

interface OpenGraphProps {
    image?: string;
    title: string;
    url: string;
    description: string;
}

class OpenGraphMeta extends React.Component<OpenGraphProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { title, description, url, image } = this.props;

        const realUrl = url || "https://nh.ihateani.me/";
        const realImage = image || "/images/social-card.png";

        return (
            <>
                {title && <meta property="og:title" content={title} />}
                {description && <meta property="og:description" content={description} />}
                {realImage && <meta property="og:image" content={realImage} />}
                <meta property="og:url" content={realUrl} />
                <meta property="og:site_name" content="nHProxy" />
                <meta property="og:type" content="website" />
            </>
        );
    }
}

export default OpenGraphMeta;
