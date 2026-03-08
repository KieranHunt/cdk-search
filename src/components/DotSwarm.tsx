const DOT_COUNT = 10;
const MAX_RADIUS = 9;
const VIEW_SIZE = 20;
const CENTER = VIEW_SIZE / 2;

const DOT_RADIUS = 1.3;
const MIN_GAP = DOT_RADIUS * 2;
const MAX_ATTEMPTS = 100;

type Dot = { cx: number; cy: number };

const randomCandidate = (): Dot => {
	const angle = Math.random() * 2 * Math.PI;
	const radius = Math.random() * Math.random() * MAX_RADIUS;
	return {
		cx: CENTER + radius * Math.cos(angle),
		cy: CENTER + radius * Math.sin(angle),
	};
};

const overlaps = (candidate: Dot, placed: Dot[]): boolean =>
	placed.some((d) => Math.hypot(candidate.cx - d.cx, candidate.cy - d.cy) < MIN_GAP);

const generateDots = (): Dot[] => {
	const placed: Dot[] = [];
	for (let i = 0; i < DOT_COUNT; i++) {
		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const candidate = randomCandidate();
			if (!overlaps(candidate, placed)) {
				placed.push(candidate);
				break;
			}
		}
	}
	return placed;
};

export const DotSwarm = () => {
	const dots = generateDots();

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
				<circle key={i} cx={dot.cx} cy={dot.cy} r={DOT_RADIUS} />
			))}
		</svg>
	);
};
