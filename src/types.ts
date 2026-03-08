export interface Element {
	id: string;
	name: string;
	type: "CloudFormation Resource" | "Construct";
	service: string;
	cdkReferenceDoc: string;
}

export interface Index {
	elements: Element[];
}
