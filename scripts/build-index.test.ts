import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";

import {
	buildElements,
	deriveService,
	isCfnResource,
	isConstruct,
	stripMarkdown,
} from "./build-index";
import type { JsiiType } from "./download-jsii";

// ── Helpers to build JSII fixture data ───────────────────────────────

const jsiiType = (overrides: Partial<JsiiType> & Pick<JsiiType, "fqn" | "name">) => ({
	kind: "class" as const,
	assembly: "aws-cdk-lib",
	...overrides,
});

const jsiiAssembly = (types: Record<string, ReturnType<typeof jsiiType>>) => ({
	name: "aws-cdk-lib",
	version: "2.200.0",
	types,
});

// Minimal base-class chain so isConstruct can walk to constructs.Construct
const CONSTRUCT_CHAIN = {
	"constructs.Construct": jsiiType({
		fqn: "constructs.Construct",
		name: "Construct",
		assembly: "constructs",
	}),
	"aws-cdk-lib.Resource": jsiiType({
		fqn: "aws-cdk-lib.Resource",
		name: "Resource",
		base: "constructs.Construct",
		abstract: true,
	}),
	"aws-cdk-lib.CfnElement": jsiiType({
		fqn: "aws-cdk-lib.CfnElement",
		name: "CfnElement",
		base: "constructs.Construct",
		abstract: true,
	}),
	"aws-cdk-lib.CfnRefElement": jsiiType({
		fqn: "aws-cdk-lib.CfnRefElement",
		name: "CfnRefElement",
		base: "aws-cdk-lib.CfnElement",
		abstract: true,
	}),
	"aws-cdk-lib.CfnResource": jsiiType({
		fqn: "aws-cdk-lib.CfnResource",
		name: "CfnResource",
		base: "aws-cdk-lib.CfnRefElement",
	}),
};

// ── deriveService ────────────────────────────────────────────────────

describe("deriveService", () => {
	it("strips aws-cdk-lib.aws_ prefix", () => {
		expect(deriveService("aws-cdk-lib.aws_fis")).toMatchInlineSnapshot(`"fis"`);
	});

	it("strips aws-cdk-lib.aws_ prefix for s3", () => {
		expect(deriveService("aws-cdk-lib.aws_s3")).toMatchInlineSnapshot(`"s3"`);
	});

	it("strips aws-cdk-lib. but not aws_ when there is no aws_ prefix", () => {
		expect(deriveService("aws-cdk-lib.alexa_ask")).toMatchInlineSnapshot(`"alexa_ask"`);
	});

	it("returns the name unchanged when there is no submodule", () => {
		expect(deriveService("aws-cdk-lib")).toMatchInlineSnapshot(`"aws-cdk-lib"`);
	});
});

// ── isConstruct ──────────────────────────────────────────────────────

describe("isConstruct", () => {
	it("returns true for constructs.Construct itself", () => {
		expect(isConstruct("constructs.Construct", {})).toBe(true);
	});

	it("returns true for a class that directly extends constructs.Construct", () => {
		const types = {
			"my.Thing": jsiiType({
				fqn: "my.Thing",
				name: "Thing",
				base: "constructs.Construct",
			}),
		};
		expect(isConstruct("my.Thing", types)).toBe(true);
	});

	it("returns true for a class deep in the construct chain", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.Bucket": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.Bucket",
				name: "Bucket",
				namespace: "aws_s3",
				base: "aws-cdk-lib.Resource",
			}),
		};
		expect(isConstruct("aws-cdk-lib.aws_s3.Bucket", types)).toBe(true);
	});

	it("returns false for a class with no base", () => {
		const types = {
			"aws-cdk-lib.Duration": jsiiType({
				fqn: "aws-cdk-lib.Duration",
				name: "Duration",
			}),
		};
		expect(isConstruct("aws-cdk-lib.Duration", types)).toBe(false);
	});

	it("returns false for a class whose chain does not reach constructs.Construct", () => {
		const types = {
			"aws-cdk-lib.SomeBase": jsiiType({
				fqn: "aws-cdk-lib.SomeBase",
				name: "SomeBase",
			}),
			"aws-cdk-lib.SomeChild": jsiiType({
				fqn: "aws-cdk-lib.SomeChild",
				name: "SomeChild",
				base: "aws-cdk-lib.SomeBase",
			}),
		};
		expect(isConstruct("aws-cdk-lib.SomeChild", types)).toBe(false);
	});

	it("returns false for an unknown fqn", () => {
		expect(isConstruct("does.not.Exist", {})).toBe(false);
	});

	it("uses the cache on repeated calls", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.Bucket": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.Bucket",
				name: "Bucket",
				namespace: "aws_s3",
				base: "aws-cdk-lib.Resource",
			}),
		};
		const cache = new Map<string, boolean>();

		isConstruct("aws-cdk-lib.aws_s3.Bucket", types, cache);
		expect(cache.get("aws-cdk-lib.aws_s3.Bucket")).toBe(true);
		expect(cache.get("aws-cdk-lib.Resource")).toBe(true);
		expect(cache.get("constructs.Construct")).toBe(true);
	});
});

// ── isCfnResource ────────────────────────────────────────────────────

describe("isCfnResource", () => {
	it("returns true when cloudformationResource custom tag is present", () => {
		expect(
			isCfnResource(
				jsiiType({
					fqn: "aws-cdk-lib.aws_s3.CfnBucket",
					name: "CfnBucket",
					docs: { custom: { cloudformationResource: "AWS::S3::Bucket" } },
				}),
			),
		).toBe(true);
	});

	it("returns false when no custom tags exist", () => {
		expect(
			isCfnResource(
				jsiiType({
					fqn: "aws-cdk-lib.aws_s3.Bucket",
					name: "Bucket",
					docs: { summary: "An S3 bucket." },
				}),
			),
		).toBe(false);
	});

	it("returns false when docs are absent", () => {
		expect(
			isCfnResource(
				jsiiType({
					fqn: "aws-cdk-lib.aws_s3.Bucket",
					name: "Bucket",
				}),
			),
		).toBe(false);
	});
});

// ── buildElements ────────────────────────────────────────────────────

describe("buildElements", () => {
	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("1992-05-22"));
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("returns an empty array for an assembly with no types", () => {
		expect(buildElements(jsiiAssembly({}))).toEqual([]);
	});

	it("builds a Construct element from a non-abstract class extending Construct", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.Bucket": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.Bucket",
				name: "Bucket",
				namespace: "aws_s3",
				base: "aws-cdk-lib.Resource",
				docs: { summary: "An S3 bucket with associated policy objects." },
			}),
		};
		const elements = buildElements(jsiiAssembly(types));

		expect(elements).toContainEqual({
			id: "aws-cdk-lib.aws_s3.Bucket",
			name: "Bucket",
			type: "Construct",
			service: "s3",
			cdkReferenceDoc: "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.Bucket.html",
			description: "An S3 bucket with associated policy objects.",
		});
	});

	it("builds a CloudFormation Resource element from a class with the cloudformationResource tag", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.CfnBucket": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.CfnBucket",
				name: "CfnBucket",
				namespace: "aws_s3",
				base: "aws-cdk-lib.CfnResource",
				docs: {
					summary: "A CloudFormation `AWS::S3::Bucket`.",
					stability: "external",
					custom: { cloudformationResource: "AWS::S3::Bucket" },
				},
			}),
		};
		const elements = buildElements(jsiiAssembly(types));

		expect(elements).toContainEqual({
			id: "aws-cdk-lib.aws_s3.CfnBucket",
			name: "CfnBucket",
			type: "CloudFormation Resource",
			service: "s3",
			cdkReferenceDoc:
				"https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.CfnBucket.html",
			description: "A CloudFormation AWS::S3::Bucket.",
		});
	});

	it("excludes abstract classes", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.BucketBase": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.BucketBase",
				name: "BucketBase",
				namespace: "aws_s3",
				base: "aws-cdk-lib.Resource",
				abstract: true,
			}),
		};
		const result = buildElements(jsiiAssembly(types));

		expect(result.find((e) => e.name === "BucketBase")).toBeUndefined();
	});

	it("excludes enums and interfaces", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.BucketEncryption": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.BucketEncryption",
				name: "BucketEncryption",
				namespace: "aws_s3",
				kind: "enum",
			}),
			"aws-cdk-lib.aws_s3.IBucket": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.IBucket",
				name: "IBucket",
				namespace: "aws_s3",
				kind: "interface",
			}),
		};
		const result = buildElements(jsiiAssembly(types));

		expect(result.find((e) => e.name === "BucketEncryption")).toBeUndefined();
		expect(result.find((e) => e.name === "IBucket")).toBeUndefined();
	});

	it("excludes non-construct classes like Duration", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.Duration": jsiiType({
				fqn: "aws-cdk-lib.Duration",
				name: "Duration",
			}),
		};
		const result = buildElements(jsiiAssembly(types));

		expect(result.find((e) => e.name === "Duration")).toBeUndefined();
	});

	it("omits description when docs.summary is absent", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.Bucket": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.Bucket",
				name: "Bucket",
				namespace: "aws_s3",
				base: "aws-cdk-lib.Resource",
			}),
		};
		const elements = buildElements(jsiiAssembly(types));
		const bucket = elements.find((e) => e.name === "Bucket");

		expect(bucket).toBeDefined();
		expect(bucket).not.toHaveProperty("description");
	});

	it("strips markdown from descriptions", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.aws_s3.Bucket": jsiiType({
				fqn: "aws-cdk-lib.aws_s3.Bucket",
				name: "Bucket",
				namespace: "aws_s3",
				base: "aws-cdk-lib.Resource",
				docs: {
					summary: "A public key for [signed URLs](https://example.com) .",
				},
			}),
		};
		const elements = buildElements(jsiiAssembly(types));
		const bucket = elements.find((e) => e.name === "Bucket");

		expect(bucket?.description).toBe("A public key for signed URLs .");
	});

	it("uses aws-cdk-lib as service for root-module constructs", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.Stack": jsiiType({
				fqn: "aws-cdk-lib.Stack",
				name: "Stack",
				base: "constructs.Construct",
			}),
		};
		const elements = buildElements(jsiiAssembly(types));
		const stack = elements.find((e) => e.name === "Stack");

		expect(stack?.service).toBe("aws-cdk-lib");
	});

	it("preserves underscores in service names without aws_ prefix", () => {
		const types = {
			...CONSTRUCT_CHAIN,
			"aws-cdk-lib.alexa_ask.CfnSkill": jsiiType({
				fqn: "aws-cdk-lib.alexa_ask.CfnSkill",
				name: "CfnSkill",
				namespace: "alexa_ask",
				base: "aws-cdk-lib.CfnResource",
				docs: { custom: { cloudformationResource: "Alexa::ASK::Skill" } },
			}),
		};
		const elements = buildElements(jsiiAssembly(types));

		expect(elements).toContainEqual(
			expect.objectContaining({
				id: "aws-cdk-lib.alexa_ask.CfnSkill",
				service: "alexa_ask",
				type: "CloudFormation Resource",
			}),
		);
	});
});

// ── stripMarkdown ────────────────────────────────────────────────────

describe("stripMarkdown", () => {
	it("returns plain text unchanged", () => {
		expect(stripMarkdown("An S3 bucket with associated policy objects.")).toBe(
			"An S3 bucket with associated policy objects.",
		);
	});

	it("strips markdown links, keeping the link text", () => {
		expect(
			stripMarkdown(
				"A public key that you can use with [signed URLs and signed cookies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PrivateContent.html) .",
			),
		).toBe("A public key that you can use with signed URLs and signed cookies .");
	});

	it("strips backtick-wrapped code", () => {
		expect(stripMarkdown("The `AWS::S3::Bucket` resource creates an Amazon S3 bucket.")).toBe(
			"The AWS::S3::Bucket resource creates an Amazon S3 bucket.",
		);
	});

	it("strips emphasis asterisks", () => {
		expect(stripMarkdown("Creates or updates an Evidently *experiment* .")).toBe(
			"Creates or updates an Evidently experiment .",
		);
	});

	it("strips blockquote markers", () => {
		expect(stripMarkdown("> AWS Chatbot is now renamed.")).toBe("AWS Chatbot is now renamed.");
	});
});
