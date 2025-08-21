import { PieChart } from "@mantine/charts";
import { Card, Text, ActionIcon } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import React from "react";
import { Campaign } from "~/models/CampaignsModel";
import classes from "./CampaignContactOutcomeSummary.module.css";
import { useGetCallDispositionReportParents } from "~/queries/callDispositionQueries";

interface CCOSummaryProps {
	campaign?: Campaign;
}

const CampaignContactOutcomeSummary: React.FC<CCOSummaryProps> = ({
	campaign,
}) => {
	const { data, refetch } = useGetCallDispositionReportParents({
		campaignId: campaign?.id,
	});

	const PIE_DATA = [
		{
			name: data?.dispositions[0]?.dispositionName || "Effective Contact",
			value: data?.dispositions[0]?.count || 0,
			color: "#86d686", // Light green matching the image
		},
		{
			name: data?.dispositions[1]?.dispositionName || "No Effective Contact",
			value: data?.dispositions[1]?.count || 0,
			color: "#d97570", // Red matching the image
		},
		{
			name: data?.dispositions[2]?.dispositionName || "No Contact",
			value: data?.dispositions[2]?.count || 0,
			color: "#f0994f", // Orange matching the image
		},
	];

	const LEGEND = [
		{
			label: data?.dispositions[0]?.dispositionName || "Effective Contact",
			value: data?.dispositions[0]?.count || 0,
			percent: data?.dispositions[0]?.percentage || 0,
			color: "#86d686",
		},
		{
			label: data?.dispositions[1]?.dispositionName || "No Effective Contact",
			value: data?.dispositions[1]?.count || 0,
			percent: data?.dispositions[1]?.percentage || 0,
			color: "#f0994f",
		},
		{
			label: data?.dispositions[2]?.dispositionName || "No Contact",
			value: data?.dispositions[2]?.count || 0,
			percent: data?.dispositions[2]?.percentage || 0,
			color: "#d97570",
		},
	];
	return (
		<Card className={classes.root} radius="lg" withBorder={false}>
			<div className={classes.headerContainer}>
				<div>
					<Text className={classes.header}>Contact Outcome Summary</Text>
					<Text className={classes.subheader}>
						Quick view of contact distribution by result.
					</Text>
				</div>
				<ActionIcon
					variant="subtle"
					color="gray"
					size="sm"
					className={classes.refreshButton}
					onClick={() => refetch()}
					aria-label="Refresh data"
				>
					<IconRefresh size={16} />
				</ActionIcon>
			</div>
			<PieChart
				data={PIE_DATA}
				size={150}
				strokeWidth={3}
				h={150}
				mb="lg"
				strokeColor="#ffffff"
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
							{item.value} ({item.percent})
						</Text>
					</div>
				))}
			</div>
			<div className={classes.calls}>
				<Text span className={classes.callsLabel}>
					Today's calls
				</Text>
				<Text span className={classes.callsValue}>
					{data?.totalCalls.toLocaleString()}
				</Text>
			</div>
		</Card>
	);
};

export default CampaignContactOutcomeSummary;
