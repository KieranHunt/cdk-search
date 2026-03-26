import indexData from "../../public/search-index.json";
import type { Element } from "../types";
import { DotSwarm } from "./DotSwarm";
import { GitHubLogo } from "./GitHubLogo";
import { RaycastLogo } from "./RaycastLogo";

const elements: Element[] = indexData.elements as Element[];
const generatedAt: string = indexData.generatedAt as string;

const quicklinkJson = JSON.stringify([
	{
		name: "cdk-search",
		link: 'https://cdk-search.kieran.casa/?q={argument name="query"}',
		iconName: "magnifying-glass-16",
	},
]);
const quicklinkUrl = URL.createObjectURL(new Blob([quicklinkJson], { type: "application/json" }));

export const Footer = () => (
	<div className="mt-4 px-3 text-xs text-slate-400 grid grid-cols-2 gap-x-4 gap-y-1">
		<p>
			Construct data from{" "}
			<a href="https://github.com/aws/aws-cdk" className="no-underline hover:text-slate-300">
				aws-cdk-lib
			</a>
			,{" "}
			<a
				href="https://github.com/aws/aws-cdk/blob/main/LICENSE"
				className="no-underline hover:text-slate-300"
			>
				Apache-2.0
			</a>
		</p>
		<p className="text-right">
			Made with <DotSwarm /> by{" "}
			<a href="https://kieran.casa" className="no-underline text-slate-400 hover:text-slate-300">
				Kieran
			</a>
		</p>
		<p>Last updated @ {generatedAt}</p>
		<p className="text-right">
			View on{" "}
			<a
				href="https://github.com/KieranHunt/cdk-search"
				className="no-underline hover:text-slate-300"
			>
				<GitHubLogo /> Github
			</a>
		</p>
		<p>{elements.length.toLocaleString()} constructs in the index</p>
		<p className="text-right">
			Add to{" "}
			<a
				href={quicklinkUrl}
				download="cdk-search.quicklink.json"
				className="no-underline hover:text-slate-300"
			>
				<RaycastLogo /> Raycast
			</a>
		</p>
	</div>
);
