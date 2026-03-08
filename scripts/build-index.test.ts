import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { deriveService, parseIndex } from "./build-index";

// Helpers to build fixture HTML

const navGroups = (inner: string) => `<div class="navGroups">${inner}</div>`;

const subNavGroup = (title: string, items: string[]) => `
  <div class="navGroup subNavGroup" role="listitem">
    <h4 class="navGroupSubcategoryTitle" role="presentation">${title}</h4>
    <ul>
      ${items.map((item) => `<li class="navListItem"><a class="navItem">${item}</a></li>`).join("")}
    </ul>
  </div>`;

const navGroup = (title: string, subNavGroups: string = "") => `
  <div class="navGroup">
    <h3 class="navGroupCategoryTitle collapsible">${title}<span class="arrow"></span></h3>
    <ul>
      <li class="navListItem"><a class="navItem" href="#">Overview</a></li>
      ${subNavGroups}
    </ul>
  </div>`;

const API_REFERENCE_GROUP = navGroup("API Reference");

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

	it("strips @aws-cdk/ prefix, -alpha suffix, and aws- prefix from scoped package", () => {
		expect(deriveService("@aws-cdk/aws-gamelift-alpha")).toMatchInlineSnapshot(`"gamelift"`);
	});

	it("strips @aws-cdk/ prefix, -alpha suffix, and aws- prefix for bedrock", () => {
		expect(deriveService("@aws-cdk/aws-bedrock-alpha")).toMatchInlineSnapshot(`"bedrock"`);
	});

	it("strips @aws-cdk/ prefix and -alpha suffix when no aws- prefix", () => {
		expect(deriveService("@aws-cdk/amplify-alpha")).toMatchInlineSnapshot(`"amplify"`);
	});
});

describe("parseIndex", () => {
	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("1992-05-22"));
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("returns empty elements for empty HTML", () => {
		expect(parseIndex("")).toMatchInlineSnapshot(`
      {
        "elements": [],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("returns empty elements for blocklisted groups only", () => {
		expect(parseIndex(navGroups(API_REFERENCE_GROUP))).toMatchInlineSnapshot(`
      {
        "elements": [],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("returns empty elements for a module with no indexed subgroups", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup(
					"aws-cdk-lib.aws_s3",
					subNavGroup("Interfaces", ["IBucket"]) + subNavGroup("Enums", ["BucketEncryption"]),
				),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("parses CloudFormation Resources from a single module", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup(
					"aws-cdk-lib.aws_fis",
					subNavGroup("CloudFormation Resources", [
						"CfnExperimentTemplate",
						"CfnTargetAccountConfiguration",
					]),
				),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_fis.CfnExperimentTemplate.html",
            "id": "aws-cdk-lib.aws_fis.CfnExperimentTemplate",
            "name": "CfnExperimentTemplate",
            "service": "fis",
            "type": "CloudFormation Resource",
          },
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_fis.CfnTargetAccountConfiguration.html",
            "id": "aws-cdk-lib.aws_fis.CfnTargetAccountConfiguration",
            "name": "CfnTargetAccountConfiguration",
            "service": "fis",
            "type": "CloudFormation Resource",
          },
        ],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("flattens CloudFormation Resources from multiple modules in order", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup(
					"aws-cdk-lib.aws_s3",
					subNavGroup("CloudFormation Resources", ["CfnBucket", "CfnBucketPolicy"]),
				) +
				navGroup(
					"aws-cdk-lib.aws_fis",
					subNavGroup("CloudFormation Resources", ["CfnExperimentTemplate"]),
				),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.CfnBucket.html",
            "id": "aws-cdk-lib.aws_s3.CfnBucket",
            "name": "CfnBucket",
            "service": "s3",
            "type": "CloudFormation Resource",
          },
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.CfnBucketPolicy.html",
            "id": "aws-cdk-lib.aws_s3.CfnBucketPolicy",
            "name": "CfnBucketPolicy",
            "service": "s3",
            "type": "CloudFormation Resource",
          },
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_fis.CfnExperimentTemplate.html",
            "id": "aws-cdk-lib.aws_fis.CfnExperimentTemplate",
            "name": "CfnExperimentTemplate",
            "service": "fis",
            "type": "CloudFormation Resource",
          },
        ],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("indexes Constructs alongside CloudFormation Resources in document order", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup(
					"aws-cdk-lib.aws_s3",
					subNavGroup("Constructs", ["Bucket"]) +
						subNavGroup("CloudFormation Resources", ["CfnBucket"]) +
						subNavGroup("Interfaces", ["IBucket"]),
				),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.Bucket.html",
            "id": "aws-cdk-lib.aws_s3.Bucket",
            "name": "Bucket",
            "service": "s3",
            "type": "Construct",
          },
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.CfnBucket.html",
            "id": "aws-cdk-lib.aws_s3.CfnBucket",
            "name": "CfnBucket",
            "service": "s3",
            "type": "CloudFormation Resource",
          },
        ],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("parses Constructs from a module with only Constructs", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup("aws-cdk-lib.aws_lambda_nodejs", subNavGroup("Constructs", ["NodejsFunction"])),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.NodejsFunction.html",
            "id": "aws-cdk-lib.aws_lambda_nodejs.NodejsFunction",
            "name": "NodejsFunction",
            "service": "lambda_nodejs",
            "type": "Construct",
          },
        ],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("ignores subgroups that are not Constructs or CloudFormation Resources", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup(
					"aws-cdk-lib.aws_s3",
					subNavGroup("Structs", ["BucketProps"]) + subNavGroup("Interfaces", ["IBucket"]),
				),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("preserves underscores in service names without aws_ prefix", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup("aws-cdk-lib.alexa_ask", subNavGroup("CloudFormation Resources", ["CfnSkill"])),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.alexa_ask.CfnSkill.html",
            "id": "aws-cdk-lib.alexa_ask.CfnSkill",
            "name": "CfnSkill",
            "service": "alexa_ask",
            "type": "CloudFormation Resource",
          },
        ],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("strips superscript footnote characters from module names", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup(
					"aws-cdk-lib.aws_route53profiles¹",
					subNavGroup("CloudFormation Resources", ["CfnProfile"]),
				),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_route53profiles.CfnProfile.html",
            "id": "aws-cdk-lib.aws_route53profiles.CfnProfile",
            "name": "CfnProfile",
            "service": "route53profiles",
            "type": "CloudFormation Resource",
          },
        ],
        "generatedAt": "1992-05-22",
      }
    `);
	});

	it("replaces / with _ in scoped package URLs and derives service correctly", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup(
					"@aws-cdk/aws-gamelift-alpha",
					subNavGroup("Constructs", ["QueuedMatchmakingConfiguration"]),
				),
		);
		expect(parseIndex(html)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "cdkReferenceDoc": "https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-gamelift-alpha.QueuedMatchmakingConfiguration.html",
            "id": "@aws-cdk/aws-gamelift-alpha.QueuedMatchmakingConfiguration",
            "name": "QueuedMatchmakingConfiguration",
            "service": "gamelift",
            "type": "Construct",
          },
        ],
        "generatedAt": "1992-05-22",
      }
    `);
	});
});
