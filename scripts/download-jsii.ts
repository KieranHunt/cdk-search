import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import ky from "ky";
import { z } from "zod";

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

export const JsiiAssemblySchema = z.object({
	name: z.string(),
	version: z.string(),
	types: z.record(z.string(), JsiiTypeSchema).optional(),
});

export type JsiiType = z.infer<typeof JsiiTypeSchema>;
export type JsiiAssembly = z.infer<typeof JsiiAssemblySchema>;

// ── Download + validate ──────────────────────────────────────────────

const JSII_URL = "https://unpkg.com/aws-cdk-lib@latest/.jsii.gz";

const main = async () => {
	console.log(`Fetching JSII assembly from ${JSII_URL}...`);
	const compressed = Buffer.from(
		await ky(JSII_URL, {
			retry: {
				limit: 30,
				delay: () => 1000,
				retryOnTimeout: true,
			},
		}).arrayBuffer(),
	);
	const json = gunzipSync(compressed).toString("utf-8");
	const assembly = JsiiAssemblySchema.parse(JSON.parse(json));

	console.log(
		`Validated JSII assembly: ${assembly.name}@${assembly.version} with ${Object.keys(assembly.types ?? {}).length} types`,
	);

	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const outDir = join(scriptDir, "..", "public");
	const outFile = join(outDir, "jsii.json");

	await mkdir(outDir, { recursive: true });
	await writeFile(outFile, JSON.stringify(assembly, null, 2));

	console.log(`Wrote validated assembly to ${outFile}`);
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
