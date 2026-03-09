import { createRoot } from "react-dom/client";

import { Footer } from "./components/Footer";
import { Layout } from "./components/Layout";
import { Search } from "./components/Search";
import { SearchIcon } from "./components/SearchIcon";

const App = () => (
	<Layout>
		<div className="w-full max-w-xl">
			<div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
				<div className="mb-5 flex items-center justify-center gap-3 text-4xl">
					<SearchIcon className="size-[0.75em] self-center translate-y-[0.05em]" />
					<h1 className="font-bold text-slate-100 leading-none">CDK Search</h1>
				</div>
				<Search />
			</div>
			<Footer />
		</div>
	</Layout>
);

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(<App />);
