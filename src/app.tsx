import { createRoot } from "react-dom/client";
import { Layout } from "./components/Layout";
import { Search } from "./components/Search";

const App = () => (
	<Layout>
		<div className="max-w-2xl mx-auto px-6 py-16">
			<Search />
		</div>
	</Layout>
);

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(<App />);
