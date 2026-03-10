import { createRoot } from "react-dom/client";

import { Footer } from "./components/Footer";
import { Layout } from "./components/Layout";
import { Search } from "./components/Search";

const App = () => (
	<Layout>
		<div className="w-full max-w-xl">
			<h1 className="text-6xl font-bold text-indigo-300 font-light mb-8 text-center font-cursive [text-shadow:0_0_10px_color-mix(in_oklch,var(--color-indigo-300)_60%,transparent),0_0_30px_color-mix(in_oklch,var(--color-indigo-300)_40%,transparent),0_0_60px_color-mix(in_oklch,var(--color-indigo-300)_20%,transparent)]">
				CDK Search
			</h1>
			<div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
				<Search />
			</div>
			<Footer />
		</div>
	</Layout>
);

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(<App />);
