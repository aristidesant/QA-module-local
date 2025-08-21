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

	const greenColor = "#66d266ff";
	const orangeColor = "#ec8022ff";
	const redColor = "#d8463eff";

	// Function to get color based on disposition name
	const getColorForDisposition = (dispositionName: string) => {
		const name = dispositionName.toLowerCase();
		if (name.includes("effective contact") && !name.includes("no effective")) {
			return greenColor;
		}
		if (name.includes("no effective") || name.includes("not effective")) {
			return orangeColor;
		}
		if (name.includes("no contact") || name.includes("not contacted")) {
			return redColor;
		}
		// Default fallback colors
		return name.includes("contact") ? greenColor : orangeColor;
	};

	const PIE_DATA =
		data?.dispositions?.map((disposition) => ({
			name: disposition.dispositionName,
			value: disposition.count,
			color: getColorForDisposition(disposition.dispositionName),
		})) || [];

	const LEGEND =
		data?.dispositions?.map((disposition) => ({
			label: disposition.dispositionName,
			value: disposition.count,
			percent: disposition.percentage,
			color: getColorForDisposition(disposition.dispositionName),
		})) || [];
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
				{LEGEND.map((item, index) => (
					<div className={classes.legendItem} key={`${item.label}-${index}`}>
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
