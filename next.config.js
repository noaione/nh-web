const fs = require("fs");

// Monkeypatch preact package.json
const preactConfig = __dirname + "/node_modules/preact/package.json";
const preactPackage = JSON.parse(fs.readFileSync(preactConfig));
preactPackage.exports = Object.assign({}, preactPackage.exports, {
    "./compat/jsx-runtime.js": preactPackage.exports["./jsx-runtime"],
});
console.info("Monkeypatching preact");
fs.writeFileSync(preactConfig, JSON.stringify(preactPackage, null, 4));

module.exports = {
    eslint: {
        dirs: ["pages", "components", "lib"],
    },
    swcLoader: true,
    swcMinify: true,
    productionBrowserSourceMaps: true,
    webpack: (config, { dev, isServer, webpack }) => {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|mp4)$/i,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        publicPath: "/_next",
                        name: "static/media/[name].[hash].[ext]",
                    },
                },
            ],
        });

        if (!dev && !isServer) {
            // Replace React with Preact only in client production build
            Object.assign(config.resolve.alias, {
                react: "preact/compat",
                "react-dom/test-utils": "preact/test-utils",
                "react-dom": "preact/compat",
                "react/jsx-runtime": "preact/jsx-runtime",
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
            {
                source: "/booba/a/:path*",
                destination: "/api/images/avatar/:path*",
            },
            {
                source: "/g/:path*",
                destination: "/read/:path*",
            },
        ];
    },
    images: {
        domains: ["api.ihateani.me", "t.nhentai.net", "i.nhentai.net"],
    },
};
