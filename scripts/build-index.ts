import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { load } from "cheerio";

import type { Element, Index } from "../src/types";

const SIDENAV_URL = "https://docs.aws.amazon.com/cdk/api/v2/_sidenav.lmth";

const CDK_DOCS_BASE = "https://docs.aws.amazon.com/cdk/api/v2/docs";

const BLOCKLIST = new Set(["API Reference"]);

const SUBGROUP_TYPES: Partial<Record<string, Element["type"]>> = {
	"CloudFormation Resources": "CloudFormation Resource",
	Constructs: "Construct",
};

export const deriveService = (moduleName: string): string =>
	moduleName
		.replace(/^aws-cdk-lib\./, "")
		.replace(/^@aws-cdk\/aws-/, "")
		.replace(/^@aws-cdk\//, "")
		.replace(/-alpha$/, "")
		.replace(/^aws_/, "");

export const parseIndex = (html: string): Index => {
	const $ = load(html);

	const elements = $(".navGroups > div")
		.toArray()
		.flatMap((el) => {
			const name = $(el)
				.find("h3.navGroupCategoryTitle")
				.first()
				.text()
				.trim()
				.replace(/\p{No}/gu, "");

			if (!name || BLOCKLIST.has(name)) return [];

			const service = deriveService(name);

			return $(el)
				.find("h4.navGroupSubcategoryTitle")
				.toArray()
				.flatMap((h4) => {
					const type = SUBGROUP_TYPES[$(h4).text().trim()];

					if (!type) return [];

					return $(h4)
						.next("ul")
						.find("li a")
						.toArray()
						.map((a) => {
							const elementName = $(a).text().trim();
							const id = `${name}.${elementName}`;
							const urlSlug = `${name.replace("/", "_")}.${elementName}`;
							return {
								id,
								name: elementName,
								type,
								service,
								cdkReferenceDoc: `${CDK_DOCS_BASE}/${urlSlug}.html`,
							};
						});
				});
		});

	return { generatedAt: new Date().toISOString().slice(0, 10), elements };
};

const main = async () => {
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
};

// Only run when executed directly, not when imported by tests
const isMain =
	// Bun
	(typeof Bun !== "undefined" && import.meta.path === Bun.main) ||
	// Node.js / Vitest
	(typeof process !== "undefined" && process.argv[1] === fileURLToPath(import.meta.url));

if (isMain) {
	await main();
}
