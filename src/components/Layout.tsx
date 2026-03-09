import type { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => (
	<main className="flex min-h-screen flex-col items-center justify-start px-4 pt-[8vh] sm:pt-[15vh]">
		{children}
	</main>
);
