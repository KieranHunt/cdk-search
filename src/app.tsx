import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { Footer } from "./components/Footer";
import { Search } from "./components/Search";

const OptionLabel = ({ label }: { label: string }) => (
	<div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 px-6 py-2 backdrop-blur">
		<p className="text-sm font-medium text-slate-400">{label}</p>
	</div>
);

const SearchCard = ({ children }: { children: ReactNode }) => (
	<div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
		{children}
	</div>
);

const Option1 = () => (
	<section className="flex min-h-screen flex-col">
		<OptionLabel label="Option 1: Top-left site header" />
		<header className="border-b border-slate-800 px-6 py-4">
			<div className="mx-auto max-w-5xl">
				<h1 className="text-2xl font-bold text-slate-500">CDK Search</h1>
			</div>
		</header>
		<div className="flex flex-1 flex-col items-center px-4 pt-[8vh] sm:pt-[15vh]">
			<div className="w-full max-w-xl">
				<SearchCard>
					<Search />
				</SearchCard>
				<Footer />
			</div>
		</div>
	</section>
);

const Option2 = () => (
	<section className="flex min-h-screen flex-col">
		<OptionLabel label="Option 2: Inline with search card" />
		<div className="flex flex-1 flex-col items-center px-4 pt-[8vh] sm:pt-[15vh]">
			<div className="w-full max-w-xl">
				<SearchCard>
					<h1 className="mb-3 text-xl font-bold text-slate-500">CDK Search</h1>
					<Search />
				</SearchCard>
				<Footer />
			</div>
		</div>
	</section>
);

const Option3 = () => (
	<section className="flex min-h-screen flex-col">
		<OptionLabel label="Option 3: Left-aligned above card" />
		<div className="flex flex-1 flex-col items-center px-4 pt-[8vh] sm:pt-[15vh]">
			<div className="w-full max-w-xl">
				<h1 className="mb-3 text-3xl font-bold text-slate-500">CDK Search</h1>
				<SearchCard>
					<Search />
				</SearchCard>
				<Footer />
			</div>
		</div>
	</section>
);

const App = () => (
	<main>
		<Option1 />
		<Option2 />
		<Option3 />
	</main>
);

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(<App />);
