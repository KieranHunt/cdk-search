import { describe, expect, it } from "vitest";
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
});

describe("parseIndex", () => {
	it("returns empty elements for empty HTML", () => {
		expect(parseIndex("")).toMatchInlineSnapshot(`
      {
        "elements": [],
      }
    `);
	});

	it("returns empty elements for blocklisted groups only", () => {
		expect(parseIndex(navGroups(API_REFERENCE_GROUP))).toMatchInlineSnapshot(`
      {
        "elements": [],
      }
    `);
	});

	it("returns empty elements for a module with no CloudFormation Resources subgroup", () => {
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
			      "module": "aws-cdk-lib.aws_fis",
			      "name": "CfnExperimentTemplate",
			      "service": "fis",
			      "type": "CloudFormation Resource",
			    },
			    {
			      "module": "aws-cdk-lib.aws_fis",
			      "name": "CfnTargetAccountConfiguration",
			      "service": "fis",
			      "type": "CloudFormation Resource",
			    },
			  ],
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
			      "module": "aws-cdk-lib.aws_s3",
			      "name": "CfnBucket",
			      "service": "s3",
			      "type": "CloudFormation Resource",
			    },
			    {
			      "module": "aws-cdk-lib.aws_s3",
			      "name": "CfnBucketPolicy",
			      "service": "s3",
			      "type": "CloudFormation Resource",
			    },
			    {
			      "module": "aws-cdk-lib.aws_fis",
			      "name": "CfnExperimentTemplate",
			      "service": "fis",
			      "type": "CloudFormation Resource",
			    },
			  ],
			}
		`);
	});

	it("ignores non-CloudFormation Resources subgroups alongside CFN ones", () => {
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
			      "module": "aws-cdk-lib.aws_s3",
			      "name": "CfnBucket",
			      "service": "s3",
			      "type": "CloudFormation Resource",
			    },
			  ],
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
			      "module": "aws-cdk-lib.alexa_ask",
			      "name": "CfnSkill",
			      "service": "alexa_ask",
			      "type": "CloudFormation Resource",
			    },
			  ],
			}
		`);
	});
});
