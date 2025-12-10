import classes from './CampaignStatusCard.module.css';

// TODO: Delete this component
export default function CampaignStatusCard() {
	return (
		<div className={classes.card}>
			<div className={classes.header}>
				<h3 className={classes.title}>Campaign status</h3>
			</div>

			<div className={classes.content}>
				<div className={classes.chartContainer}>
					<svg viewBox='0 0 120 120' className={classes.donut}>
						{/* Running - Blue */}
						<circle
							cx='60'
							cy='60'
							r='40'
							fill='none'
							stroke='#228be6'
							strokeWidth='12'
							strokeDasharray='89.5 251.2'
							strokeDashoffset='0'
							transform='rotate(-90 60 60)'
						/>
						{/* Active - Green */}
						<circle
							cx='60'
							cy='60'
							r='40'
							fill='none'
							stroke='#51cf66'
							strokeWidth='12'
							strokeDasharray='31.4 251.2'
							strokeDashoffset='-89.5'
							transform='rotate(-90 60 60)'
						/>
						{/* Paused - Orange */}
						<circle
							cx='60'
							cy='60'
							r='40'
							fill='none'
							stroke='#ff922b'
							strokeWidth='12'
							strokeDasharray='94.2 251.2'
							strokeDashoffset='-120.9'
							transform='rotate(-90 60 60)'
						/>
						{/* Warning - Red */}
						<circle
							cx='60'
							cy='60'
							r='40'
							fill='none'
							stroke='#fa5252'
							strokeWidth='12'
							strokeDasharray='37.7 251.2'
							strokeDashoffset='-215.1'
							transform='rotate(-90 60 60)'
						/>
					</svg>
					<div className={classes.centerLabel}>
						<div className={classes.totalNumber}>254</div>
						<div className={classes.totalText}>Campaigns</div>
					</div>
				</div>

				<div className={classes.legend}>
					<div className={classes.legendItem}>
						<div className={`${classes.dot} ${classes.running}`}></div>
						<span className={classes.legendLabel}>Running</span>
						<span className={classes.legendValue}>3,500 (40%)</span>
					</div>
					<div className={classes.legendItem}>
						<div className={`${classes.dot} ${classes.active}`}></div>
						<span className={classes.legendLabel}>Active</span>
						<span className={classes.legendValue}>2,250 (60%)</span>
					</div>
					<div className={classes.legendItem}>
						<div className={`${classes.dot} ${classes.paused}`}></div>
						<span className={classes.legendLabel}>Paused</span>
						<span className={classes.legendValue}>19,708 (64.23%)</span>
					</div>
					<div className={classes.legendItem}>
						<div className={`${classes.dot} ${classes.warning}`}></div>
						<span className={classes.legendLabel}>Warning</span>
						<span className={classes.legendValue}>10,708 (64.23%)</span>
					</div>
				</div>
			</div>
		</div>
	);
}
