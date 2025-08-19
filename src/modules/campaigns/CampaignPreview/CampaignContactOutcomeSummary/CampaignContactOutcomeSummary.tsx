import { PieChart } from "@mantine/charts";
import { Card, Text } from "@mantine/core";
import React from "react";
import { Campaign } from "~/models/CampaignsModel";
import classes from "./CampaignContactOutcomeSummary.module.css";

// Pie chart data and colors - matching the image colors exactly
const PIE_DATA = [
	{
		name: "Effective Contact",
		value: 412,
		color: "#86d686", // Light green matching the image
	},
	{
		name: "No Effective Contact",
		value: 823,
		color: "#f0994f", // Orange matching the image
	},
	{
		name: "No Contact",
		value: 314,
		color: "#d97570", // Red matching the image
	},
];

const TOTAL_CALLS = 1549;

const LEGEND = [
	{
		label: "Effective Contact",
		value: 412,
		percent: 27,
		color: "#86d686",
	},
	{
		label: "No Effective Contact",
		value: 823,
		percent: 53,
		color: "#f0994f",
	},
	{
		label: "No Contact",
		value: 314,
		percent: 20,
		color: "#d97570",
	},
];

interface CCOSummaryProps {
	campaign?: Campaign;
}

const CampaignContactOutcomeSummary: React.FC<CCOSummaryProps> = () => {
	return (
		<Card className={classes.root} radius="lg" withBorder={false}>
			<Text className={classes.header}>Contact Outcome Summary</Text>
			<Text className={classes.subheader}>
				Quick view of contact distribution by result.
			</Text>
			<PieChart
				data={PIE_DATA}
				size={160}
				strokeWidth={3}
				strokeColor="#ffffff"
				withTooltip
				tooltipDataSource="segment"
			/>
			<div className={classes.legend}>
				{LEGEND.map((item) => (
					<div className={classes.legendItem} key={item.label}>
						<span
							className={classes.legendDot}
							style={{ background: item.color }}
						/>
						<Text span className={classes.legendLabel}>
							{item.label}
						</Text>
						<Text span className={classes.legendValue}>
							{item.value} ({item.percent}%)
						</Text>
					</div>
				))}
			</div>
			<div className={classes.calls}>
				<Text span className={classes.callsLabel}>
					Today's calls
				</Text>
				<Text span className={classes.callsValue}>
					{TOTAL_CALLS.toLocaleString()}
				</Text>
			</div>
		</Card>
	);
};

export default CampaignContactOutcomeSummary;
