import React from "react";
import styles from "./ScoreGauge.module.css";

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
	const radius = 45;
	const strokeWidth = 6;
	const circumference = Math.PI * radius; // Half circumference for semi-circle
	const strokeOffset = circumference - (score / 100) * circumference;

	// Color based on score
	const getScoreColor = (score: number) => {
		if (score >= 80) return "#10b981"; // green
		if (score >= 60) return "#f59e0b"; // yellow/orange
		if (score >= 40) return "#f97316"; // orange
		return "#ef4444"; // red
	};

	const scoreColor = getScoreColor(score);

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				{/* Semi-circular Progress */}
				<div className={styles.gaugeContainer}>
					<svg className={styles.gaugeSvg} viewBox="0 0 102 54">
						{/* Background semi-circle */}
						<path
							d={`M 6 51 A ${radius} ${radius} 0 0 1 96 51`}
							stroke="#e5e7eb"
							strokeWidth={strokeWidth}
							fill="none"
						/>
						{/* Progress semi-circle */}
						<path
							d={`M 6 51 A ${radius} ${radius} 0 0 1 96 51`}
							stroke={scoreColor}
							strokeWidth={strokeWidth}
							fill="none"
							strokeLinecap="round"
							strokeDasharray={circumference}
							strokeDashoffset={strokeOffset}
							className={styles.progressPath}
						/>
					</svg>
					{/* Score text */}
					<div className={styles.scoreTextContainer}>
						<span className={styles.scoreText}>{score}</span>
					</div>
				</div>

				{/* Label */}
				<h2 className={styles.label}>Overall Score</h2>
			</div>
		</div>
	);
};

export default ScoreGauge;
