import esbuild from "esbuild"

const watch = process.argv.includes("--watch")

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "../src/static/widget.js",
  format: "iife",
  target: ["es2018"],
  minify: true,
  legalComments: "none",
  loader: {
    ".css": "text",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
}

if (watch) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
  console.log("[widget] watching src/ -> ../src/static/widget.js")
} else {
  await esbuild.build(options)
  console.log("[widget] built -> ../src/static/widget.js")
}
