import { describe, expect, it } from "vitest";
import { parseModules } from "./build-index";

// Minimal helper to wrap content in the .navGroups container
const navGroups = (inner: string) => `<div class="navGroups">${inner}</div>`;

const navGroup = (title: string, href?: string) => `
  <div class="navGroup">
    <h3 class="navGroupCategoryTitle collapsible">${title}<span class="arrow"></span></h3>
    <ul>
      ${href ? `<li class="navListItem"><a class="navItem" href="${href}">${title}</a></li>` : ""}
    </ul>
  </div>`;

const API_REFERENCE_GROUP = navGroup(
	"API Reference",
	"/cdk/api/v2/docs/aws-construct-library.html",
);

describe("parseModules", () => {
	it("returns an empty array for empty HTML", () => {
		expect(parseModules("")).toMatchInlineSnapshot(`[]`);
	});

	it("excludes blocklisted groups", () => {
		const html = navGroups(API_REFERENCE_GROUP);
		expect(parseModules(html)).toMatchInlineSnapshot(`[]`);
	});

	it("excludes blocklisted groups regardless of position", () => {
		const html = navGroups(
			navGroup("aws-cdk-lib", "/cdk/api/v2/docs/aws-cdk-lib-readme.html") + API_REFERENCE_GROUP,
		);
		expect(parseModules(html)).toMatchInlineSnapshot(`
      [
        {
          "name": "aws-cdk-lib",
          "url": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html",
        },
      ]
    `);
	});

	it("parses a single module", () => {
		const html = navGroups(
			API_REFERENCE_GROUP + navGroup("aws-cdk-lib", "/cdk/api/v2/docs/aws-cdk-lib-readme.html"),
		);
		expect(parseModules(html)).toMatchInlineSnapshot(`
      [
        {
          "name": "aws-cdk-lib",
          "url": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html",
        },
      ]
    `);
	});

	it("parses multiple modules in order", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				navGroup("aws-cdk-lib", "/cdk/api/v2/docs/aws-cdk-lib-readme.html") +
				navGroup("aws-cdk-lib.aws_s3", "/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html") +
				navGroup("aws-cdk-lib.aws_lambda", "/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html"),
		);
		expect(parseModules(html)).toMatchInlineSnapshot(`
      [
        {
          "name": "aws-cdk-lib",
          "url": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html",
        },
        {
          "name": "aws-cdk-lib.aws_s3",
          "url": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html",
        },
        {
          "name": "aws-cdk-lib.aws_lambda",
          "url": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html",
        },
      ]
    `);
	});

	it("skips a group that has no <a> href", () => {
		const html = navGroups(
			API_REFERENCE_GROUP +
				`<div class="navGroup">
          <h3 class="navGroupCategoryTitle collapsible">aws-cdk-lib.aws_empty</h3>
          <ul></ul>
        </div>` +
				navGroup("aws-cdk-lib.aws_s3", "/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html"),
		);
		expect(parseModules(html)).toMatchInlineSnapshot(`
      [
        {
          "name": "aws-cdk-lib.aws_s3",
          "url": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html",
        },
      ]
    `);
	});

	it("uses the readme link, not links from subNavGroups", () => {
		// Reproduces the real structure: a module group whose first <a> is the readme,
		// followed by subNavGroup items with individual construct links
		const html = navGroups(
			API_REFERENCE_GROUP +
				`<div class="navGroup">
          <h3 class="navGroupCategoryTitle collapsible">aws-cdk-lib.aws_s3<span class="arrow"></span></h3>
          <ul>
            <li class="navListItem">
              <a class="navItem" href="/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html">Overview</a>
            </li>
            <div class="navGroup subNavGroup">
              <h4>Constructs</h4>
              <ul>
                <li><a href="/cdk/api/v2/docs/aws-cdk-lib.aws_s3.Bucket.html">Bucket</a></li>
              </ul>
            </div>
          </ul>
        </div>`,
		);
		expect(parseModules(html)).toMatchInlineSnapshot(`
      [
        {
          "name": "aws-cdk-lib.aws_s3",
          "url": "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html",
        },
      ]
    `);
	});
});
