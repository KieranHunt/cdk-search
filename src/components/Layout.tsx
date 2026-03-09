import type { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => (
	<main className="flex min-h-screen flex-col items-center justify-start pt-[15vh]">
		{children}
	</main>
);
