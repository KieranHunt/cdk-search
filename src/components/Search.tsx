import { useMemo, useState } from "react";
import indexData from "../../public/search-index.json";
import type { Element } from "../types";

const SAMPLE_SIZE = 7;

const elements: Element[] = indexData.elements as Element[];

const docUrl = (element: Element): string =>
	`https://docs.aws.amazon.com/cdk/api/v2/docs/${element.module}.${element.name}.html`;

export function fisherYates<T>(a: T[]): T[] {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

const randomSample = (items: Element[], size: number): Element[] =>
	fisherYates([...items]).slice(0, size);

export const Search = () => {
	const [query, setQuery] = useState("");

	const sample = useMemo(() => randomSample(elements, SAMPLE_SIZE), []);

	const results = useMemo(() => {
		if (query.trim() === "") return sample;
		const q = query.toLowerCase();
		return elements.filter(
			(el) => el.name.toLowerCase().includes(q) || el.service.toLowerCase().includes(q),
		);
	}, [query, sample]);

	const isFiltered = query.trim() !== "";

	return (
		<div>
			<label htmlFor="cdk-search" className="sr-only">
				Search CDK resources
			</label>
			<input
				id="cdk-search"
				type="search"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search by name or service…"
				className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
			/>

			<p className="mt-3 text-xs text-gray-400">
				{isFiltered ? `${results.length} result${results.length === 1 ? "" : "s"}` : ""}
			</p>

			{results.length === 0 ? (
				<p className="mt-6 text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
			) : (
				<ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
					{results.map((el) => (
						<li key={`${el.module}.${el.name}`}>
							<a
								href={docUrl(el)}
								target="_blank"
								rel="noreferrer"
								className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
							>
								<span className="font-mono text-sm font-medium text-gray-900">{el.name}</span>
								<span className="ml-4 shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
									{el.service}
								</span>
							</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
