import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import removeMd from "remove-markdown";
import { z } from "zod";

import type { Element, Index } from "../src/types";

const JSII_URL = "https://unpkg.com/aws-cdk-lib@latest/.jsii.gz";

const CDK_DOCS_BASE = "https://docs.aws.amazon.com/cdk/api/v2/docs";

// ── Zod schemas for the JSII assembly ────────────────────────────────

const JsiiDocsSchema = z.object({
	summary: z.string().optional(),
	stability: z.string().optional(),
	deprecated: z.string().optional(),
	custom: z.record(z.string(), z.string()).optional(),
});

const JsiiTypeSchema = z.object({
	fqn: z.string(),
	name: z.string(),
	kind: z.enum(["class", "enum", "interface"]),
	namespace: z.string().optional(),
	assembly: z.string(),
	base: z.string().optional(),
	abstract: z.boolean().optional(),
	docs: JsiiDocsSchema.optional(),
});

const JsiiAssemblySchema = z.object({
	name: z.string(),
	version: z.string(),
	types: z.record(z.string(), JsiiTypeSchema).optional(),
});

type JsiiType = z.infer<typeof JsiiTypeSchema>;
type JsiiAssembly = z.infer<typeof JsiiAssemblySchema>;

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

// ── Fetch + validate ─────────────────────────────────────────────────

export const fetchAssembly = async (): Promise<JsiiAssembly> => {
	console.log(`Fetching JSII assembly from ${JSII_URL}...`);
	const response = await fetch(JSII_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch JSII assembly: ${response.status} ${response.statusText}`);
	}

	const compressed = Buffer.from(await response.arrayBuffer());
	const json = gunzipSync(compressed).toString("utf-8");
	return JsiiAssemblySchema.parse(JSON.parse(json));
};

// ── Main ─────────────────────────────────────────────────────────────

const main = async () => {
	const assembly = await fetchAssembly();

	console.log(
		`Parsed JSII assembly: ${assembly.name}@${assembly.version} with ${Object.keys(assembly.types ?? {}).length} types`,
	);

	const elements = buildElements(assembly);

	const index: Index = {
		generatedAt: new Date().toISOString().slice(0, 10),
		elements,
	};

	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const outDir = join(scriptDir, "..", "public");
	const outFile = join(outDir, "search-index.json");

	await mkdir(outDir, { recursive: true });
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
