import styles from './RankingPublishedModal.module.css';

/** Angles of the six petals around the flower's centre. */
const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

/** A flower that opens once, and two hands that clap beneath it. Strokes follow the primary colour. */
export function BloomIllustration() {
	return (
		<svg
			viewBox='0 0 160 150'
			width={160}
			height={150}
			aria-hidden='true'
			className={styles.art}
		>
			{/* stem and leaves */}
			<path d='M80 96 C80 84 80 72 80 60' className={styles.line} />
			<path
				d='M80 84 C70 84 62 78 60 70 C68 70 76 74 80 84 Z'
				className={styles.leaf}
			/>
			<path
				d='M80 78 C90 78 98 72 100 64 C92 64 84 68 80 78 Z'
				className={styles.leaf}
			/>

			{/* petals around the centre (80,52); the rotation sits on the wrapper, the opening on the petal */}
			<g>
				{PETAL_ANGLES.map((angle) => (
					<g
						key={angle}
						className={styles.petalSlot}
						transform={`rotate(${angle} 80 52)`}
					>
						<ellipse cx='80' cy='34' rx='9' ry='17' className={styles.petal} />
					</g>
				))}
			</g>
			<circle cx='80' cy='52' r='7' className={styles.core} />

			{/* hands: two mitten outlines facing each other, pivoting at the wrist */}
			<g className={styles.handLeft}>
				<path
					d='M44 136 L44 118 C44 108 56 106 60 112 L62 128 C62 134 56 138 50 138 Z'
					className={styles.hand}
				/>
			</g>
			<g className={styles.handRight}>
				<path
					d='M116 136 L116 118 C116 108 104 106 100 112 L98 128 C98 134 104 138 110 138 Z'
					className={styles.hand}
				/>
			</g>
		</svg>
	);
}

export default BloomIllustration;
