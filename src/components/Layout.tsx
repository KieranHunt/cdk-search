import type { ReactNode } from "react";

function Header() {
	return (
		<header className="border-b border-gray-200 bg-white">
			<div className="max-w-2xl mx-auto px-6 py-3">
				<a href="/" className="text-sm font-semibold tracking-tight text-gray-900">
					CDK Search
				</a>
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer className="border-t border-gray-200 bg-white mt-auto">
			<div className="max-w-2xl mx-auto px-6 py-6 text-xs text-gray-400">CDK Search</div>
		</footer>
	);
}

export function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
