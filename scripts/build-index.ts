import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import removeMd from "remove-markdown";

import type { Element, Index } from "../src/types";
import { JsiiAssemblySchema } from "./download-jsii";
import type { JsiiAssembly, JsiiType } from "./download-jsii";

const CDK_DOCS_BASE = "https://docs.aws.amazon.com/cdk/api/v2/docs";

// ── Helpers ──────────────────────────────────────────────────────────

export const stripMarkdown = (text: string): string => removeMd(text);

export const deriveService = (moduleName: string): string =>
	moduleName.replace(/^aws-cdk-lib\./, "").replace(/^aws_/, "");

const CONSTRUCT_ROOT = "constructs.Construct";

/** Memoised check: does the class at `fqn` extend `constructs.Construct`? */
export const isConstruct = (
	fqn: string,
	types: Record<string, JsiiType>,
	cache: Map<string, boolean> = new Map(),
): boolean => {
	const cached = cache.get(fqn);
	if (cached !== undefined) return cached;

	if (fqn === CONSTRUCT_ROOT) {
		cache.set(fqn, true);
		return true;
	}

	const base = types[fqn]?.base;
	const result = base ? isConstruct(base, types, cache) : false;
	cache.set(fqn, result);
	return result;
};

/** Is this type an L1 CloudFormation resource wrapper? */
export const isCfnResource = (type: JsiiType): boolean =>
	Boolean(type.docs?.custom?.cloudformationResource);

// ── Core: build elements from the JSII assembly ─────────────────────

export const buildElements = (assembly: JsiiAssembly): Element[] => {
	const types = assembly.types ?? {};
	const cache = new Map<string, boolean>();

	return Object.values(types).flatMap((type): Element[] => {
		if (type.kind !== "class") return [];
		if (type.abstract) return [];
		if (!isConstruct(type.fqn, types, cache)) return [];

		const cfnResource = isCfnResource(type);
		const moduleName = type.namespace ? `${type.assembly}.${type.namespace}` : type.assembly;

		const urlSlug = `${moduleName.replace("/", "_")}.${type.name}`;
		const description = type.docs?.summary ? stripMarkdown(type.docs.summary) : undefined;

		return [
			{
				id: type.fqn,
				name: type.name,
				type: cfnResource ? "CloudFormation Resource" : "Construct",
				service: deriveService(moduleName),
				cdkReferenceDoc: `${CDK_DOCS_BASE}/${urlSlug}.html`,
				...(description && { description }),
			},
		];
	});
};

// ── Main ─────────────────────────────────────────────────────────────

const main = async () => {
	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const publicDir = join(scriptDir, "..", "public");
	const jsiiFile = join(publicDir, "jsii.json");

	console.log(`Reading JSII assembly from ${jsiiFile}...`);
	const json = await readFile(jsiiFile, "utf-8");
	const assembly = JsiiAssemblySchema.parse(JSON.parse(json));

	console.log(
		`Parsed JSII assembly: ${assembly.name}@${assembly.version} with ${Object.keys(assembly.types ?? {}).length} types`,
	);

	const elements = buildElements(assembly);

	const index: Index = {
		generatedAt: new Date().toISOString().slice(0, 10),
		elements,
	};

	const outFile = join(publicDir, "search-index.json");
	await writeFile(outFile, JSON.stringify(index, null, 2));

	console.log(`Wrote ${elements.length} elements to ${outFile}`);
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
