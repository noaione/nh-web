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

        if (!isServer) {
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
    images: {
        domains: ["api.ihateani.me", "t.nhentai.net", "i.nhentai.net"],
    },
};
