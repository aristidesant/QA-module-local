import { Group, Text, Box, Card, Title, Skeleton } from "@mantine/core";
import styles from "./StatusBreakdown.module.css";
import { PieChart } from "@mantine/charts";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { useCallDispositionReport } from "~/queries/callDispositionQueries";

export const StatusBreakdown = () => {
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);
	const { data, isLoading } = useCallDispositionReport({
		campaignId: selectedCampaign?.id,
	});

	const generateChartColors = (index: number): string => {
		const colors = [
			"#51cf66", // green
			"#339af0", // blue
			"#ff922b", // orange
			"#ff6b6b", // red
			"#9775fa", // purple
			"#22b8cf", // cyan
			"#ffd43b", // yellow
			"#f783ac", // pink
			"#748ffc", // indigo
			"#20c997", // teal
		];
		return colors[index % colors.length];
	};

	return (
		<Card className={styles.card}>
			<Title order={5} mb="xs" className={styles.title}>
				Status Breakdown
			</Title>
			<Text size="xs" c="dimmed" mb="md" className={styles.subtitle}>
				Quick view of contact distribution by status.
			</Text>

			<div className={styles.container}>
				<div className={styles.chartContainer}>
					{isLoading ? (
						<>
							{/* Skeleton for pie chart */}
							<Skeleton circle height={160} width={160} />

							<div className={styles.statusList}>
								{/* Skeleton for status items */}
								{Array.from({ length: 5 }).map((_, index) => (
									<Group key={index} justify="space-between" mb="xs">
										<Group gap="xs">
											<Skeleton circle height={12} width={12} />
											<Skeleton height={12} width={100} />
										</Group>
										<Skeleton height={12} width={30} />
									</Group>
								))}
								<Box className={styles.totalContainer} mt="sm" p="xs">
									<Group justify="space-between">
										<Skeleton height={12} width={40} />
										<Skeleton height={12} width={30} />
									</Group>
								</Box>
							</div>
						</>
					) : (
						<>
							{/* Pie chart */}
							<PieChart
								data={
									(data?.dispositions?.map((dp, index) => ({
										name: dp.dispositionName,
										value: dp.count,
										color: generateChartColors(index),
									})) as any) ?? []
								}
								size={160}
								h={160}
								strokeWidth={3}
								mb="lg"
								strokeColor="#ffffff"
							/>

							<div className={styles.statusList}>
								{data?.dispositions?.map((item, index) => (
									<Group
										key={`${item?.dispositionName}-${index}`}
										justify="space-between"
										mb="xs"
									>
										<Group gap="xs">
											<Box
												className={styles.colorDot}
												style={{ backgroundColor: generateChartColors(index) }}
											/>
											<Text size="xs">{item.dispositionName}</Text>
										</Group>
										<Text size="xs" fw={500}>
											{item.count.toLocaleString()}
										</Text>
									</Group>
								))}
								<Box className={styles.totalContainer} mt="sm" p="xs">
									<Group justify="space-between">
										<Text size="xs" fw={600}>
											Total
										</Text>
										<Text size="xs" fw={600}>
											{data?.totalCalls?.toLocaleString()}
										</Text>
									</Group>
								</Box>
							</div>
						</>
					)}
				</div>
			</div>
		</Card>
	);
};
