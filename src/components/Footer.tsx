import indexData from "../../public/search-index.json";
import type { Element } from "../types";
import { DotSwarm } from "./DotSwarm";
import { GitHubLogo } from "./GitHubLogo";

const elements: Element[] = indexData.elements as Element[];
const generatedAt: string = indexData.generatedAt as string;

export const Footer = () => (
	<div className="mt-4 px-3 text-xs text-slate-400 grid grid-cols-2 gap-x-4">
		<p>Last updated @ {generatedAt}</p>
		<p className="text-right">
			Made with <DotSwarm /> by{" "}
			<a href="https://kieran.casa" className="no-underline text-slate-500 hover:text-slate-300">
				Kieran
			</a>
		</p>
		<p>{elements.length.toLocaleString()} constructs in the index</p>
		<p className="text-right">
			View on{" "}
			<a
				href="https://github.com/KieranHunt/cdk-search"
				className="no-underline hover:text-slate-300"
			>
				<GitHubLogo /> Github
			</a>
		</p>
	</div>
);
