import { loadAwsServiceSpec } from "@aws-cdk/aws-service-spec";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConstructEntry {
  /** Fully-qualified identifier, e.g. "aws-cdk-lib.aws_s3.CfnBucket" */
  id: string;
  /** Class name, e.g. "CfnBucket" */
  name: string;
  /** CDK module name, e.g. "aws-s3" */
  module: string;
  /** CloudFormation resource type, e.g. "AWS::S3::Bucket" */
  cfnType: string;
  /** Short plain-text description (markdown stripped, max 300 chars) */
  description: string;
  /** Link to the CDK API docs for this construct */
  docsUrl: string;
  /** Classification tags, e.g. ["l1"] */
  tags: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip markdown links and backtick code spans for plain-text display. */
function stripMarkdown(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
    .replace(/`([^`]+)`/g, "$1")             // `code` -> code
    .trim();
}

/** "AWS::S3::Bucket" -> "Cfn" + "Bucket" = "CfnBucket" */
function toCfnClassName(cfnType: string): string {
  const parts = cfnType.split("::");
  return "Cfn" + parts[parts.length - 1];
}

/** "AWS::S3::Bucket" -> "AWS::S3" */
function cfnNamespace(cfnType: string): string {
  const parts = cfnType.split("::");
  return parts.slice(0, 2).join("::");
}

/** "aws-s3" -> "aws_s3" (for CDK docs URL) */
function moduleToDocsSegment(module: string): string {
  return module.replace(/-/g, "_");
}

function buildDocsUrl(module: string, className: string): string {
  return `https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.${moduleToDocsSegment(module)}.${className}.html`;
}

// ---------------------------------------------------------------------------
// Main extraction
// ---------------------------------------------------------------------------

async function extract(): Promise<ConstructEntry[]> {
  // Load the scope-map so we can resolve CFN namespace -> CDK module name.
  // In GitHub Actions the aws-cdk repo is cloned alongside this repo; when
  // running locally we look for it as a sibling directory.
  // In CI the aws-cdk repo is cloned as a sibling of the scripts/ dir.
  // Path: scripts/ -> ../ -> cdk-search root -> aws-cdk/
  const scopeMapPath = new URL(
    "../aws-cdk/packages/aws-cdk-lib/scripts/scope-map.json",
    import.meta.url
  );
  const scopeMap: Record<string, { scopes: { namespace: string }[] }> =
    await Bun.file(scopeMapPath).json();

  // Build reverse lookup: "AWS::S3" -> "aws-s3"
  const nsToModule = new Map<string, string>();
  for (const [module, config] of Object.entries(scopeMap)) {
    for (const scope of config.scopes) {
      nsToModule.set(scope.namespace, module);
    }
  }

  const db = await loadAwsServiceSpec();
  const entityMap = db.schema.resource.dehydrate().entities as Record<
    string,
    {
      $id: string;
      cloudFormationType: string;
      name: string;
      documentation?: string;
      tagInformation?: { tagPropertyName: string; variant: string };
    }
  >;

  const entries: ConstructEntry[] = [];

  for (const entity of Object.values(entityMap)) {
    const cfnType = entity.cloudFormationType;
    const ns = cfnNamespace(cfnType);
    const module = nsToModule.get(ns);

    if (!module) {
      // Shouldn't happen, but skip rather than crash.
      process.stderr.write(`WARN: no CDK module found for ${cfnType}\n`);
      continue;
    }

    const className = toCfnClassName(cfnType);
    const rawDoc = entity.documentation ?? "";
    const description = stripMarkdown(rawDoc).slice(0, 300);

    const tags: string[] = ["l1"];

    entries.push({
      id: `aws-cdk-lib.${moduleToDocsSegment(module)}.${className}`,
      name: className,
      module,
      cfnType,
      description,
      docsUrl: buildDocsUrl(module, className),
      tags,
    });
  }

  // Sort alphabetically by CFN type for deterministic output.
  entries.sort((a, b) => a.cfnType.localeCompare(b.cfnType));

  return entries;
}

// ---------------------------------------------------------------------------
// Entry point — write JSON to stdout
// ---------------------------------------------------------------------------

const entries = await extract();
process.stdout.write(JSON.stringify(entries, null, 2) + "\n");
process.stderr.write(`Extracted ${entries.length} L1 constructs.\n`);
