import { useMemo, useState } from "react";

import indexData from "../../public/search-index.json";
import type { Element } from "../types";

const elements: Element[] = indexData.elements as Element[];

const SAMPLE_SIZE = 7;

export const fisherYates = <T,>(a: T[]): T[] => {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};

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
			<div className="relative">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.5"
						d="m10 10 4.25 4.25m-3-7.75a4.75 4.75 0 1 1-9.5 0 4.75 4.75 0 0 1 9.5 0"
					/>
				</svg>
				<input
					id="cdk-search"
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search by name or service…"
					className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-base text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600"
					autoFocus
				/>
			</div>

			<p className={`mt-3 text-xs text-slate-400 ${isFiltered ? "" : "invisible"}`}>
				{results.length} result{results.length === 1 ? "" : "s"}
			</p>

			{results.length > 0 && (
				<ul className="mt-2 max-h-[25rem] divide-y divide-slate-800 overflow-y-auto rounded-lg">
					{results.map((el) => (
						<li key={el.id}>
							<a
								href={el.cdkReferenceDoc}
								target="_blank"
								rel="noreferrer"
								className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-800/50"
							>
								<span className="font-mono text-sm font-medium text-slate-100">{el.name}</span>
								<span className="ml-4 shrink-0 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
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
