import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import type { ReactNode } from "react";

function Header() {
	return (
		<header className="border-b border-gray-200 bg-white">
			<div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
				<span className="text-lg font-semibold tracking-tight text-gray-900">CDK Search</span>

				<NavigationMenu.Root className="relative">
					<NavigationMenu.List className="flex items-center gap-1">
						<NavigationMenu.Item>
							<NavigationMenu.Link
								className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
								href="#"
							>
								Home
							</NavigationMenu.Link>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Link
								className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
								href="#"
							>
								About
							</NavigationMenu.Link>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Link
								className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
								href="#"
							>
								Docs
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					</NavigationMenu.List>
				</NavigationMenu.Root>
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer className="border-t border-gray-200 bg-white mt-auto">
			<div className="max-w-5xl mx-auto px-6 py-6 text-sm text-gray-500">CDK Search</div>
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
