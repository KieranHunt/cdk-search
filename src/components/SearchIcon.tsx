export const SearchIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="512"
		height="512"
		fill="none"
		viewBox="0 0 512 512"
		className={className}
	>
		<rect width="512" height="512" fill="url(#search-icon-gradient)" rx="128" />
		<defs>
			<radialGradient
				id="search-icon-gradient"
				cx="50%"
				cy="50%"
				r="100%"
				fx="50%"
				fy="0%"
				gradientUnits="objectBoundingBox"
			>
				<stop stopColor="#64748b" />
				<stop offset="1" stopColor="#1e293b" />
			</radialGradient>
		</defs>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="352"
			height="352"
			x="80"
			y="80"
			viewBox="0 0 16 16"
		>
			<path
				stroke="#e2e8f0"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="m10 10 4.25 4.25m-3-7.75a4.75 4.75 0 1 1-9.5 0 4.75 4.75 0 0 1 9.5 0"
			/>
		</svg>
	</svg>
);
