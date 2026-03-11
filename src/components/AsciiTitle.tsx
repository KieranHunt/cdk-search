import { useEffect, useRef, useState } from "react";

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

const PADDING_PX = 16;

export const AsciiTitle = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const container = containerRef.current;
		const pre = preRef.current;
		if (!container || !pre) return;

		const updateScale = () => {
			const available = container.clientWidth - PADDING_PX * 2;
			const intrinsic = pre.scrollWidth;
			setScale(Math.min(1, available / intrinsic));
		};

		updateScale();

		const observer = new ResizeObserver(updateScale);
		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={containerRef} className="mb-8 flex w-full flex-col items-center">
			<h1 className="sr-only">CDK Search</h1>
			<pre
				ref={preRef}
				className="select-none whitespace-pre font-mono leading-none tracking-[-0.5px] text-indigo-300"
				style={{
					textShadow: glowShadow,
					fontSize: 11,
					transform: `scale(${scale})`,
					transformOrigin: "top center",
				}}
				aria-hidden="true"
			>
				{ASCII_ART}
			</pre>
		</div>
	);
};
