import classes from './DispositionChart.module.css';

export default function DispositionChart() {
	return (
		<div className={classes.card}>
			<div className={classes.header}>
				<h3 className={classes.title}>Outcome</h3>
			</div>

			<div className={classes.content}>
				<div className={classes.chartContainer}>
					<svg viewBox='0 0 120 120' className={classes.donut}>
						{/* Effective Contact - Green */}
						<circle
							cx='60'
							cy='60'
							r='40'
							fill='none'
							stroke='#51cf66'
							strokeWidth='12'
							strokeDasharray='100.5 251.2'
							strokeDashoffset='0'
							transform='rotate(-90 60 60)'
						/>
						{/* No Effective Contact - Orange */}
						<circle
							cx='60'
							cy='60'
							r='40'
							fill='none'
							stroke='#ff922b'
							strokeWidth='12'
							strokeDasharray='62.8 251.2'
							strokeDashoffset='-100.5'
							transform='rotate(-90 60 60)'
						/>
						{/* No Contact - Light Blue */}
						<circle
							cx='60'
							cy='60'
							r='40'
							fill='none'
							stroke='#d0ebff'
							strokeWidth='12'
							strokeDasharray='87.9 251.2'
							strokeDashoffset='-163.3'
							transform='rotate(-90 60 60)'
						/>
					</svg>
					<div className={classes.centerLabel}>
						<div className={classes.centerValue}>33.3%</div>
					</div>
				</div>

				<div className={classes.legend}>
					<div className={classes.legendItem}>
						<div className={`${classes.dot} ${classes.effective}`}></div>
						<span className={classes.legendLabel}>Effective Contact</span>
						<span className={classes.legendValue}>3,500 (40%)</span>
					</div>
					<div className={classes.legendItem}>
						<div className={`${classes.dot} ${classes.noEffective}`}></div>
						<span className={classes.legendLabel}>No Effective Contact</span>
						<span className={classes.legendValue}>5,250 (25%)</span>
					</div>
					<div className={classes.legendItem}>
						<div className={`${classes.dot} ${classes.noContact}`}></div>
						<span className={classes.legendLabel}>No Contact</span>
						<span className={classes.legendValue}>15,706 (64.23%)</span>
					</div>
				</div>
			</div>
		</div>
	);
}
