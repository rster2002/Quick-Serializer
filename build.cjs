const { build } = require("esbuild");
const dotenv = require("dotenv");
dotenv.config();

const options = {
    entryPoints: ["./run.ts"],
    outfile: "./www/out.js",
    bundle: true,
    minify: false,
    watch: true,
    sourcemap: true,
};

build(options).catch(() => process.exit(1));