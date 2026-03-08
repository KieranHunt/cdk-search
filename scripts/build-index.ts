import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const SIDENAV_URL = "https://docs.aws.amazon.com/cdk/api/v2/_sidenav.lmth";

const BLOCKLIST = new Set(["API Reference"]);

export interface Element {
	name: string;
	type: "CloudFormation Resource";
	service: string;
	module: string;
}

export interface Index {
	elements: Element[];
}

export function deriveService(moduleName: string): string {
	return moduleName.replace(/^aws-cdk-lib\./, "").replace(/^aws_/, "");
}

export function parseIndex(html: string): Index {
	const $ = load(html);

	const elements = $(".navGroups > div")
		.toArray()
		.flatMap((el) => {
			const name = $(el).find("h3.navGroupCategoryTitle").first().text().trim();

			if (!name || BLOCKLIST.has(name)) return [];

			const service = deriveService(name);

			return $(el)
				.find("h4.navGroupSubcategoryTitle")
				.toArray()
				.flatMap((h4) => {
					if ($(h4).text().trim() !== "CloudFormation Resources") return [];

					return $(h4)
						.next("ul")
						.find("li a")
						.toArray()
						.map((a) => ({
							name: $(a).text().trim(),
							type: "CloudFormation Resource" as const,
							service,
							module: name,
						}));
				});
		});

	return { elements };
}

async function main() {
	console.log(`Fetching sidenav from ${SIDENAV_URL}...`);
	const response = await fetch(SIDENAV_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch sidenav: ${response.status} ${response.statusText}`);
	}

	const html = await response.text();
	const index = parseIndex(html);

	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const outDir = join(scriptDir, "..", "public");
	const outFile = join(outDir, "search-index.json");

	await mkdir(outDir, { recursive: true });
	await writeFile(outFile, JSON.stringify(index, null, 2));

	console.log(`Wrote ${index.elements.length} elements to ${outFile}`);
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
