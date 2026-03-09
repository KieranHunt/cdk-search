import { createRoot } from "react-dom/client";

import { Footer } from "./components/Footer";
import { Layout } from "./components/Layout";
import { Search } from "./components/Search";

const noiseDataUrl = (() => {
	const size = 64;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) return "";
	const imageData = ctx.createImageData(size, size);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		if (Math.random() < 0.4) {
			data[i] = 255;
			data[i + 1] = 255;
			data[i + 2] = 255;
			data[i + 3] = Math.floor(Math.random() * 55) + 5;
		}
	}
	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL("image/png");
})();

const App = () => (
	<Layout>
		<div className="w-full max-w-xl">
			<h1
				className="mb-4 text-center text-8xl font-bold"
				style={{
					backgroundImage: `url("${noiseDataUrl}"), linear-gradient(#64748b, #64748b)`,
					backgroundSize: "64px 64px, 100% 100%",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					backgroundClip: "text",
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
