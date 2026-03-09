import { createRoot } from "react-dom/client";

import { Layout } from "./components/Layout";
import { Search } from "./components/Search";
import { SearchIcon } from "./components/SearchIcon";

const App = () => (
	<Layout>
		<div className="max-w-2xl mx-auto px-6 py-16">
			<div className="flex items-center justify-center gap-3 mb-8 text-6xl">
				<SearchIcon className="size-[0.75em] self-center translate-y-[0.05em]" />
				<h1 className="font-bold text-gray-900 leading-none">CDK Search</h1>
			</div>
			<Search />
		</div>
	</Layout>
);

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(<App />);
