import tailwind from "bun-plugin-tailwind";
import "./scripts/build-index";

const result = await Bun.build({
	entrypoints: ["./index.html"],
	compile: true,
	target: "browser",
	outdir: "./dist",
	minify: true,
	plugins: [tailwind],
});

if (!result.success) {
	console.error("Build failed:");
	for (const log of result.logs) {
		console.error(log);
	}
	process.exit(1);
} else {
	console.log("Build succeeded:", result.outputs[0].path);
}
