import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const openInNewTab = (url: string): void => {
	window.open(url, "_blank", "noreferrer");
};

export const Search = () => {
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const listRef = useRef<HTMLUListElement>(null);

	const sample = useMemo(() => randomSample(elements, SAMPLE_SIZE), []);

	const results = useMemo(() => {
		if (query.trim() === "") return sample;
		const q = query.toLowerCase();
		return elements.filter(
			(el) => el.name.toLowerCase().includes(q) || el.service.toLowerCase().includes(q),
		);
	}, [query, sample]);

	const isFiltered = query.trim() !== "";

	// Reset active index when results change
	useEffect(() => {
		setActiveIndex(0);
	}, [results]);

	// Scroll the active item into view
	useEffect(() => {
		const list = listRef.current;
		if (!list) return;
		const item = list.children[activeIndex] as HTMLElement | undefined;
		item?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (results.length === 0) return;

			switch (e.key) {
				case "ArrowDown": {
					e.preventDefault();
					setActiveIndex((prev) => (prev + 1) % results.length);
					break;
				}
				case "ArrowUp": {
					e.preventDefault();
					setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
					break;
				}
				case "Enter": {
					e.preventDefault();
					const active = results[activeIndex];
					if (active) openInNewTab(active.cdkReferenceDoc);
					break;
				}
				case "Escape": {
					e.preventDefault();
					setQuery("");
					break;
				}
			}
		},
		[results, activeIndex],
	);

	return (
		<div onKeyDown={handleKeyDown}>
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
					className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-base text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600 [&::-webkit-search-cancel-button]:appearance-none"
					autoFocus
					role="combobox"
					aria-expanded={results.length > 0}
					aria-controls="search-results"
					aria-activedescendant={results.length > 0 ? `result-${activeIndex}` : undefined}
				/>
			</div>

			<p className={`mt-3 text-xs text-slate-400 ${isFiltered ? "" : "invisible"}`}>
				{results.length} result{results.length === 1 ? "" : "s"}
			</p>

			{isFiltered && results.length === 0 && (
				<p className="mt-4 text-center text-sm text-slate-500">No results found</p>
			)}

			{results.length > 0 && (
				<ul
					id="search-results"
					ref={listRef}
					role="listbox"
					className="mt-2 max-h-[calc(7*2.75rem+6px)] divide-y divide-slate-800 overflow-x-hidden overflow-y-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				>
					{results.map((el, i) => (
						<li
							key={el.id}
							id={`result-${i}`}
							role="option"
							aria-selected={i === activeIndex}
							className={`cursor-pointer ${
								i === activeIndex ? "bg-slate-800" : "hover:bg-slate-800/50"
							}`}
							onMouseEnter={() => setActiveIndex(i)}
							onClick={() => openInNewTab(el.cdkReferenceDoc)}
						>
							<div className="flex items-center justify-between px-4 py-3">
								<span className="min-w-0 truncate font-mono text-sm font-medium text-slate-100">
									{el.name}
								</span>
								<span
									className={`ml-4 shrink-0 rounded-full px-2.5 pb-0.5 text-xs ${
										i === activeIndex
											? "bg-slate-700 text-slate-300"
											: "bg-slate-800 text-slate-400"
									}`}
								>
									{el.service}
								</span>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
