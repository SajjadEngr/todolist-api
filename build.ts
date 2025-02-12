import { build } from "esbuild";

async function runBuild() {
  try {
    await build({
      entryPoints: ["./src/index.ts"],
      bundle: true,
      minify: true,
      sourcemap: true,
      outfile: "./dist/bundle.js",
      platform: "node",
      target: "es2020",
      external: ["mock-aws-s3", "aws-sdk", "nock"],
      loader: { ".html": "file" },
    });
    console.log("Build completed successfully.");
  } catch (error) {
    console.error("Build failed:", error);
  }
}

runBuild();
