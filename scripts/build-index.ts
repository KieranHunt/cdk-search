import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const SIDENAV_URL = "https://docs.aws.amazon.com/cdk/api/v2/_sidenav.lmth";
const CDK_DOCS_BASE = "https://docs.aws.amazon.com";

const BLOCKLIST = new Set(["API Reference"]);

export interface Module {
	name: string;
	url: string;
}

export function parseModules(html: string): Module[] {
	const $ = load(html);

	return $(".navGroups > div")
		.toArray()
		.flatMap((el) => {
			const name = $(el).find("h3.navGroupCategoryTitle").first().text().trim();
			const href = $(el).find("a").first().attr("href");

			if (!name || !href || BLOCKLIST.has(name)) return [];

			return [{ name, url: `${CDK_DOCS_BASE}${href}` }];
		});
}

async function main() {
	console.log(`Fetching sidenav from ${SIDENAV_URL}...`);
	const response = await fetch(SIDENAV_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch sidenav: ${response.status} ${response.statusText}`);
	}

	const html = await response.text();
	const modules = parseModules(html);

	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const outDir = join(scriptDir, "..", "public");
	const outFile = join(outDir, "search-index.json");

	await mkdir(outDir, { recursive: true });
	await writeFile(outFile, JSON.stringify(modules, null, 2));

	console.log(`Wrote ${modules.length} modules to ${outFile}`);
}

// Only run when executed directly, not when imported by tests
const isMain =
	// Bun
	(typeof Bun !== "undefined" && import.meta.path === Bun.main) ||
	// Node.js / Vitest
	(typeof process !== "undefined" && process.argv[1] === fileURLToPath(import.meta.url));

if (isMain) {
	await main();
}
