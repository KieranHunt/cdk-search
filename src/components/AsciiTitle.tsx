const ASCII_ART = `\
 ██████╗ ██████╗  ██╗  ██╗   ███████╗ ███████╗  █████╗  ██████╗   ██████╗ ██╗  ██╗
██╔════╝ ██╔══██╗ ██║ ██╔╝   ██╔════╝ ██╔════╝ ██╔══██╗ ██╔══██╗ ██╔════╝ ██║  ██║
██║      ██║  ██║ █████╔╝    ███████╗ █████╗   ███████║ ██████╔╝ ██║      ███████║
██║      ██║  ██║ ██╔═██╗    ╚════██║ ██╔══╝   ██╔══██║ ██╔══██╗ ██║      ██╔══██║
╚██████╗ ██████╔╝ ██║  ██╗   ███████║ ███████╗ ██║  ██║ ██║  ██╗ ╚██████╗ ██║  ██║
 ╚═════╝ ╚═════╝  ╚═╝  ╚═╝   ╚══════╝ ╚══════╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝`;

const glowShadow = [
	"0 0 10px color-mix(in oklch, var(--color-indigo-300) 60%, transparent)",
	"0 0 30px color-mix(in oklch, var(--color-indigo-300) 40%, transparent)",
	"0 0 60px color-mix(in oklch, var(--color-indigo-300) 20%, transparent)",
].join(",");

export const AsciiTitle = () => (
	<div className="mb-8 flex w-full flex-col items-center">
		<h1 className="sr-only">CDK Search</h1>
		<pre
			className="select-none whitespace-pre font-mono text-[5px] leading-none tracking-[-0.5px] text-indigo-300 sm:text-[8px] md:text-[10px] lg:text-[11px]"
			style={{ textShadow: glowShadow }}
			aria-hidden="true"
		>
			{ASCII_ART}
		</pre>
	</div>
);
