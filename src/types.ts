export interface Element {
	name: string;
	type: "CloudFormation Resource";
	service: string;
	module: string;
}

export interface Index {
	elements: Element[];
}
