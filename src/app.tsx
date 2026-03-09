import { createRoot } from "react-dom/client";

import { Footer } from "./components/Footer";
import { Layout } from "./components/Layout";
import { Search } from "./components/Search";

const App = () => (
	<Layout>
		<div className="w-full max-w-xl">
			<div className="relative mb-4">
				<h1 className="text-center text-8xl font-bold text-slate-500">CDK Search</h1>
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage: `url("data:image/svg+xml,${encodeURIComponent("<svg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='10' numOctaves='1' stitchTiles='stitch'/></filter><rect width='100%' height='100%' opacity='0.07' filter='url(%23n)'/></svg>")}")`,
						mixBlendMode: "overlay",
					}}
				/>
			</div>
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
