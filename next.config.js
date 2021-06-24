module.exports = {
    future: {
        webpack5: true,
    },
    productionBrowserSourceMaps: true,
    webpack: (config, { dev, isServer, webpack }) => {
        config.plugins.push(
            new webpack.ProvidePlugin({
                React: "react",
            })
        );

        if (!dev && !isServer) {
            Object.assign(config.resolve.alias, {
                react: "preact/compat",
                "react-dom/test-utils": "preact/test-utils",
                "react-dom": "preact/compat",
                "react-ssr-prepass": "preact-ssr-prepass",
            });
        }

        const prependToEntry = isServer ? "pages/_document" : "main.js";
        const preactDebug = dev ? ["preact/debug"] : ["preact/devtools"];

        const entry = config.entry;
        config.entry = () => {
            return entry().then((entries) => {
                entries[prependToEntry] = preactDebug.concat(entries[prependToEntry] || []);
                return entries;
            });
        };

        return config;
    },
    async rewrites() {
        return [
            {
                source: "/js/kryptonite.js",
                destination: "https://tr.n4o.xyz/js/plausible.js",
            },
            {
                source: "/api/event",
                destination: "https://tr.n4o.xyz/api/event",
            },
            {
                source: "/download/:id",
                destination: "/read/:id/download",
            },
            {
                source: "/dynimg.png",
                destination: "/api/dynamic",
            },
            {
                source: "/booba/t/:path*",
                destination: "/api/images/thumb/:path*",
            },
            {
                source: "/booba/i/:path*",
                destination: "/api/images/image/:path*",
            },
        ];
    },
    images: {
        domains: ["api.ihateani.me", "t.nhentai.net", "i.nhentai.net"],
    },
};
