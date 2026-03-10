export interface Element {
	id: string;
	name: string;
	type: "CloudFormation Resource" | "Construct";
	service: string;
	cdkReferenceDoc: string;
	description?: string;
}

export interface Index {
	generatedAt: string;
	elements: Element[];
}
