import React from "react";
import classes from "./CampaignPerformance.module.css";

interface CampaignPerformanceProps {
  stats?: {
    successful: number;
    voicemails: number;
    failed: number;
    total: number;
  };
  timeLeft?: string;
  timeLeftPercent?: number;
}

// Mock values if not provided
const MOCK_STATS = {
  successful: 432,
  voicemails: 143,
  failed: 79,
  total: 654,
};
const MOCK_TIME_LEFT = "3h:12min";
const MOCK_TIME_LEFT_PERCENT = 0.68;

export const CampaignPerformance: React.FC<CampaignPerformanceProps> = ({
  stats = MOCK_STATS,
  timeLeft = MOCK_TIME_LEFT,
  timeLeftPercent = MOCK_TIME_LEFT_PERCENT,
}) => {
  // Calculate bar widths
  const total = stats.successful + stats.voicemails + stats.failed;
  const getPercent = (val: number) => (total > 0 ? (val / total) * 100 : 0);

  return (
    <div className={classes.statsSection}>
      <div className={classes.statsTitle}>Statistics</div>
      <div className={classes.statsSubtitle}>Today's Performance</div>

      {/* Bars */}
      <div>
        <div className={classes.barRow}>
          <span className={classes.barValueBubble}>{stats.successful}</span>
          <span className={classes.barLabel}>Successful</span>
          <div className={classes.barTrack}>
            <div
              className={`${classes.barFill} ${classes.barFillSuccess}`}
              style={{ width: `${getPercent(stats.successful)}%` }}
            />
          </div>
        </div>
        <div className={classes.barRow}>
          <span className={classes.barValueBubble}>{stats.voicemails}</span>
          <span className={classes.barLabel}>Voicemails</span>
          <div className={classes.barTrack}>
            <div
              className={`${classes.barFill} ${classes.barFillVoicemail}`}
              style={{ width: `${getPercent(stats.voicemails)}%` }}
            />
          </div>
        </div>
        <div className={classes.barRow}>
          <span className={classes.barValueBubble}>{stats.failed}</span>
          <span className={classes.barLabel}>Failed</span>
          <div className={classes.barTrack}>
            <div
              className={`${classes.barFill} ${classes.barFillFailed}`}
              style={{ width: `${getPercent(stats.failed)}%` }}
            />
          </div>
        </div>
        <div className={classes.percentLabels}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Total calls today */}
      <div className={classes.totalCallsCard}>
        <span>Total calls today</span>
        <span className={classes.totalCallsValue}>{stats.total}</span>
      </div>

      {/* Divider */}
      <hr className={classes.divider} />

      {/* Time left */}
      <div className={classes.timeLeftSection}>
        <div className={classes.timeLeftLabel}>
          <span>Today's time left</span>
          <span>{timeLeft}</span>
        </div>
        <div className={classes.timeLeftBarTrack}>
          <div
            className={classes.timeLeftBarFill}
            style={{ width: `${Math.round(timeLeftPercent * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
