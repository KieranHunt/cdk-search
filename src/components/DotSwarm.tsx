const DOT_COUNT = 10;
const MAX_RADIUS = 9;
const VIEW_SIZE = 20;
const CENTER = VIEW_SIZE / 2;

const randomDot = () => {
	const angle = Math.random() * 2 * Math.PI;
	const radius = Math.random() * Math.random() * MAX_RADIUS;
	return {
		cx: CENTER + radius * Math.cos(angle),
		cy: CENTER + radius * Math.sin(angle),
		r: 0.8 + Math.random() * 1.2,
		opacity: 0.4 + Math.random() * 0.6,
	};
};

export const DotSwarm = () => {
	const dots = Array.from({ length: DOT_COUNT }, randomDot);

	return (
		<svg
			width={VIEW_SIZE}
			height={VIEW_SIZE}
			viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
			fill="currentColor"
			className="inline-block align-middle"
			aria-hidden="true"
		>
			{dots.map((dot, i) => (
				<circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} opacity={dot.opacity} />
			))}
		</svg>
	);
};
