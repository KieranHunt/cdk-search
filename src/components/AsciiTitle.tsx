const ASCII_ART = `\
 ██████╗ ██████╗  ██╗  ██╗   ███████╗ ███████╗  █████╗  ██████╗   ██████╗ ██╗  ██╗
██╔════╝ ██╔══██╗ ██║ ██╔╝   ██╔════╝ ██╔════╝ ██╔══██╗ ██╔══██╗ ██╔════╝ ██║  ██║
██║      ██║  ██║ █████╔╝    ███████╗ █████╗   ███████║ ██████╔╝ ██║      ███████║
██║      ██║  ██║ ██╔═██╗    ╚════██║ ██╔══╝   ██╔══██║ ██╔══██╗ ██║      ██╔══██║
╚██████╗ ██████╔╝ ██║  ██╗   ███████║ ███████╗ ██║  ██║ ██║  ██╗ ╚██████╗ ██║  ██║
 ╚═════╝ ╚═════╝  ╚═╝  ╚═╝   ╚══════╝ ╚══════╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝`;

export const AsciiTitle = () => (
	<div className="flex w-full flex-col items-center">
		<h1 className="sr-only">CDK Search</h1>
		<pre
			className="mb-[3em] select-none whitespace-pre font-mono leading-none tracking-[-0.5px] text-indigo-300 text-[clamp(5px,1.9vw,11px)] [text-shadow:0_0_10px_color-mix(in_oklch,var(--color-indigo-300)_60%,transparent),0_0_30px_color-mix(in_oklch,var(--color-indigo-300)_40%,transparent),0_0_60px_color-mix(in_oklch,var(--color-indigo-300)_20%,transparent)]"
			aria-hidden="true"
		>
			{ASCII_ART}
		</pre>
	</div>
);
