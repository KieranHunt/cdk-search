import { createRoot } from "react-dom/client";

import { Footer } from "./components/Footer";
import { Layout } from "./components/Layout";
import { Search } from "./components/Search";

const App = () => (
	<Layout>
		<div className="w-full max-w-xl">
			<h1
				className="mb-4 text-center text-8xl font-bold"
				style={{
					backgroundImage: `url("data:image/svg+xml,${encodeURIComponent("<svg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}"), linear-gradient(#64748b, #64748b)`,
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					backgroundClip: "text",
					backgroundBlendMode: "overlay",
				}}
			>
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
