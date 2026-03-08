import { createRoot } from "react-dom/client";
import { Layout } from "./components/Layout";
import { Search } from "./components/Search";

function App() {
	return (
		<Layout>
			<div className="max-w-2xl mx-auto px-6 py-16">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">CDK Search</h1>
				<p className="mt-2 text-sm text-gray-500">
					Search CloudFormation resources across the AWS CDK construct library.
				</p>
				<div className="mt-8">
					<Search />
				</div>
			</div>
		</Layout>
	);
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(<App />);
