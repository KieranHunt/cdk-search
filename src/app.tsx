import { createRoot } from "react-dom/client";
import { Layout } from "./components/Layout";
import { ThemeDialog } from "./components/ThemeDialog";

function App() {
	return (
		<Layout>
			<div className="max-w-3xl mx-auto px-6 py-16">
				<h1 className="text-4xl font-bold tracking-tight text-gray-900">CDK Search</h1>
				<p className="mt-4 text-lg text-gray-600">
					Content coming soon. This is a placeholder page built with React, Radix UI primitives, and
					Tailwind CSS — bundled into a single HTML file with Bun.
				</p>

				<div className="mt-8 flex gap-4">
					<ThemeDialog />
				</div>
			</div>
		</Layout>
	);
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(<App />);
