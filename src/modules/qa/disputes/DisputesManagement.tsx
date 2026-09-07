import React, { useState } from 'react';
import {
	Card,
	Stack,
	Text,
	Group,
	Button,
	Textarea,
	Tabs,
	Table,
	Badge,
	Modal,
	SimpleGrid,
	Select,
	Timeline,
	Avatar,
	Divider,
	Alert,
} from '@mantine/core';
import { IconCheck, IconAlertCircle, IconMessage } from '@tabler/icons-react';

export interface DisputeComment {
	id: number;
	author: string;
	authorRole: 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER';
	content: string;
	timestamp: Date;
}

export interface Dispute {
	id: number;
	callId: number;
	agentId: number;
	agentName: string;
	supervisorId: number;
	supervisorName: string;
	evaluationScore: number;
	disputedMetrics: string[];
	reason: string;
	status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED';
	supervisorDecision?: 'APPROVED' | 'REJECTED' | 'ESCALATED';
	qaManagerDecision?: 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW';
	comments: DisputeComment[];
	createdAt: Date;
	resolvedAt?: Date;
}

interface DisputesManagementProps {
	disputes?: Dispute[];
	currentUserRole?: 'SUPERVISOR' | 'QA_MANAGER';
	currentUserId?: number;
	onUpdateDispute?: (disputeId: number, updates: Partial<Dispute>) => void;
	onAddComment?: (disputeId: number, comment: string) => void;
}

export const DisputesManagement: React.FC<DisputesManagementProps> = ({
	disputes = [],
	currentUserRole = 'SUPERVISOR',
	currentUserId,
	onUpdateDispute,
	onAddComment,
}) => {
	const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [commentText, setCommentText] = useState('');
	const [decisionText, setDecisionText] = useState('');
	const [selectedDecision, setSelectedDecision] = useState<string>('');

	const handleOpenDetail = (dispute: Dispute) => {
		setSelectedDispute(dispute);
		setCommentText('');
		setDecisionText('');
		setSelectedDecision('');
		setIsDetailModalOpen(true);
	};

	const handleAddComment = () => {
		if (commentText.trim() && selectedDispute) {
			onAddComment?.(selectedDispute.id, commentText);
			setCommentText('');
		}
	};

	const handleMakeSupervisorDecision = () => {
		if (selectedDispute && selectedDecision) {
			onUpdateDispute?.(selectedDispute.id, {
				supervisorDecision: selectedDecision as any,
				status: selectedDecision === 'ESCALATED' ? 'IN_REVIEW' : 'RESOLVED',
			});
			if (decisionText.trim()) {
				onAddComment?.(selectedDispute.id, `[DECISION: ${selectedDecision}] ${decisionText}`);
			}
			setIsDetailModalOpen(false);
		}
	};

	const handleMakeQAManagerDecision = () => {
		if (selectedDispute && selectedDecision) {
			onUpdateDispute?.(selectedDispute.id, {
				qaManagerDecision: selectedDecision as any,
				status: 'RESOLVED',
			});
			if (decisionText.trim()) {
				onAddComment?.(selectedDispute.id, `[QA MANAGER DECISION: ${selectedDecision}] ${decisionText}`);
			}
			setIsDetailModalOpen(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PENDING':
				return 'yellow';
			case 'IN_REVIEW':
				return 'blue';
			case 'RESOLVED':
				return 'green';
			default:
				return 'gray';
		}
	};

	const getSupervisorDecisionColor = (decision?: string) => {
		switch (decision) {
			case 'APPROVED':
				return 'green';
			case 'REJECTED':
				return 'red';
			case 'ESCALATED':
				return 'blue';
			default:
				return 'gray';
		}
	};

	const getQAManagerDecisionColor = (decision?: string) => {
		switch (decision) {
			case 'APPROVED':
				return 'green';
			case 'REJECTED':
				return 'red';
			case 'REQUIRES_REVIEW':
				return 'yellow';
			default:
				return 'gray';
		}
	};

	const pendingDisputes = disputes.filter((d) => d.status === 'PENDING');
	const inReviewDisputes = disputes.filter((d) => d.status === 'IN_REVIEW');
	const resolvedDisputes = disputes.filter((d) => d.status === 'RESOLVED');

	const filterDisputes = (list: Dispute[]) => {
		if (currentUserRole === 'SUPERVISOR') {
			return list.filter((d) => d.supervisorId === currentUserId);
		}
		return list;
	};

	return (
		<Stack gap="md">
			<Alert icon={<IconAlertCircle size={16} />} title="Dispute Management" color="blue">
				{currentUserRole === 'SUPERVISOR'
					? 'Review and resolve disputes from your team members. Escalate to QA Manager if needed.'
					: 'Audit and finalize all platform disputes. Ensure consistent resolution across teams.'}
			</Alert>

			<Tabs defaultValue="pending">
				<Tabs.List>
					<Tabs.Tab value="pending">
						Pending ({filterDisputes(pendingDisputes).length})
					</Tabs.Tab>
					<Tabs.Tab value="inreview">
						In Review ({filterDisputes(inReviewDisputes).length})
					</Tabs.Tab>
					<Tabs.Tab value="resolved">
						Resolved ({filterDisputes(resolvedDisputes).length})
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="pending" pt="md">
					<Card p="lg" radius="md" withBorder>
						<div style={{ overflowX: 'auto' }}>
							<Table striped>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Agent</Table.Th>
										<Table.Th>Supervisor</Table.Th>
										<Table.Th>Disputed Metrics</Table.Th>
										<Table.Th>Reason</Table.Th>
										<Table.Th>Created</Table.Th>
										<Table.Th ta="right">Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{filterDisputes(pendingDisputes).length === 0 ? (
										<Table.Tr>
											<Table.Td colSpan={6}>
												<Text size="sm" c="dimmed" ta="center" p="md">
													No pending disputes
												</Text>
											</Table.Td>
										</Table.Tr>
									) : (
										filterDisputes(pendingDisputes).map((dispute) => (
											<Table.Tr key={dispute.id}>
												<Table.Td>
													<Group gap="xs">
														<Avatar name={dispute.agentName} size="sm" color="blue" />
														<Text fw={500} size="sm">
															{dispute.agentName}
														</Text>
													</Group>
												</Table.Td>
												<Table.Td>
													<Text size="sm">{dispute.supervisorName}</Text>
												</Table.Td>
												<Table.Td>
													<Group gap="xs">
														{dispute.disputedMetrics.map((metric) => (
															<Badge key={metric} size="xs" variant="light">
																{metric}
															</Badge>
														))}
													</Group>
												</Table.Td>
												<Table.Td>
													<Text size="sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
														{dispute.reason}
													</Text>
												</Table.Td>
												<Table.Td>
													<Text size="xs" c="dimmed">
														{new Date(dispute.createdAt).toLocaleDateString()}
													</Text>
												</Table.Td>
												<Table.Td ta="right">
													<Button size="xs" onClick={() => handleOpenDetail(dispute)}>
														Review
													</Button>
												</Table.Td>
											</Table.Tr>
										))
									)}
								</Table.Tbody>
							</Table>
						</div>
					</Card>
				</Tabs.Panel>

				<Tabs.Panel value="inreview" pt="md">
					<Card p="lg" radius="md" withBorder>
						<div style={{ overflowX: 'auto' }}>
							<Table striped>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Agent</Table.Th>
										<Table.Th>Supervisor Decision</Table.Th>
										<Table.Th>QA Manager Review</Table.Th>
										<Table.Th ta="right">Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{filterDisputes(inReviewDisputes).length === 0 ? (
										<Table.Tr>
											<Table.Td colSpan={4}>
												<Text size="sm" c="dimmed" ta="center" p="md">
													No disputes in review
												</Text>
											</Table.Td>
										</Table.Tr>
									) : (
										filterDisputes(inReviewDisputes).map((dispute) => (
											<Table.Tr key={dispute.id}>
												<Table.Td>
													<Group gap="xs">
														<Avatar name={dispute.agentName} size="sm" color="blue" />
														<Text fw={500} size="sm">
															{dispute.agentName}
														</Text>
													</Group>
												</Table.Td>
												<Table.Td>
													{dispute.supervisorDecision ? (
														<Badge color={getSupervisorDecisionColor(dispute.supervisorDecision)} variant="light">
															{dispute.supervisorDecision}
														</Badge>
													) : (
														<Text size="xs" c="dimmed">
															Pending
														</Text>
													)}
												</Table.Td>
												<Table.Td>
													{dispute.qaManagerDecision ? (
														<Badge color={getQAManagerDecisionColor(dispute.qaManagerDecision)} variant="light">
															{dispute.qaManagerDecision}
														</Badge>
													) : (
														<Text size="xs" c="dimmed">
															Pending
														</Text>
													)}
												</Table.Td>
												<Table.Td ta="right">
													<Button size="xs" onClick={() => handleOpenDetail(dispute)}>
														Review
													</Button>
												</Table.Td>
											</Table.Tr>
										))
									)}
								</Table.Tbody>
							</Table>
						</div>
					</Card>
				</Tabs.Panel>

				<Tabs.Panel value="resolved" pt="md">
					<Card p="lg" radius="md" withBorder>
						<div style={{ overflowX: 'auto' }}>
							<Table striped>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Agent</Table.Th>
										<Table.Th>Supervisor Decision</Table.Th>
										<Table.Th>QA Manager Decision</Table.Th>
										<Table.Th>Resolved</Table.Th>
										<Table.Th ta="right">View</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{filterDisputes(resolvedDisputes).length === 0 ? (
										<Table.Tr>
											<Table.Td colSpan={5}>
												<Text size="sm" c="dimmed" ta="center" p="md">
													No resolved disputes
												</Text>
											</Table.Td>
										</Table.Tr>
									) : (
										filterDisputes(resolvedDisputes).map((dispute) => (
											<Table.Tr key={dispute.id}>
												<Table.Td>
													<Group gap="xs">
														<Avatar name={dispute.agentName} size="sm" color="blue" />
														<Text fw={500} size="sm">
															{dispute.agentName}
														</Text>
													</Group>
												</Table.Td>
												<Table.Td>
													{dispute.supervisorDecision ? (
														<Badge color={getSupervisorDecisionColor(dispute.supervisorDecision)} variant="light">
															{dispute.supervisorDecision}
														</Badge>
													) : (
														<Text size="xs" c="dimmed">
															—
														</Text>
													)}
												</Table.Td>
												<Table.Td>
													{dispute.qaManagerDecision ? (
														<Badge color={getQAManagerDecisionColor(dispute.qaManagerDecision)} variant="light">
															{dispute.qaManagerDecision}
														</Badge>
													) : (
														<Text size="xs" c="dimmed">
															—
														</Text>
													)}
												</Table.Td>
												<Table.Td>
													<Text size="xs" c="dimmed">
														{dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleDateString() : '—'}
													</Text>
												</Table.Td>
												<Table.Td ta="right">
													<Button size="xs" variant="light" onClick={() => handleOpenDetail(dispute)}>
														View
													</Button>
												</Table.Td>
											</Table.Tr>
										))
									)}
								</Table.Tbody>
							</Table>
						</div>
					</Card>
				</Tabs.Panel>
			</Tabs>

			<Modal
				opened={isDetailModalOpen}
				onClose={() => setIsDetailModalOpen(false)}
				title={selectedDispute ? `Dispute #${selectedDispute.id} - ${selectedDispute.agentName}` : 'Dispute Details'}
				size="lg"
				scrollAreaComponent={({ style, children }) => <div style={{ ...style, maxHeight: 600, overflow: 'auto' }}>{children}</div>}
			>
				{selectedDispute && (
					<Stack gap="md">
						<SimpleGrid cols={2}>
							<div>
								<Text fw={600} size="sm">
									Agent
								</Text>
								<Text size="sm">{selectedDispute.agentName}</Text>
							</div>
							<div>
								<Text fw={600} size="sm">
									Supervisor
								</Text>
								<Text size="sm">{selectedDispute.supervisorName}</Text>
							</div>
							<div>
								<Text fw={600} size="sm">
									Status
								</Text>
								<Badge color={getStatusColor(selectedDispute.status)}>{selectedDispute.status}</Badge>
							</div>
							<div>
								<Text fw={600} size="sm">
									Created
								</Text>
								<Text size="sm">{new Date(selectedDispute.createdAt).toLocaleString()}</Text>
							</div>
						</SimpleGrid>

						<Divider />

						<div>
							<Text fw={600} size="sm" mb="xs">
								Disputed Metrics
							</Text>
							<Group gap="xs">
								{selectedDispute.disputedMetrics.map((metric) => (
									<Badge key={metric} variant="light">
										{metric}
									</Badge>
								))}
							</Group>
						</div>

						<div>
							<Text fw={600} size="sm" mb="xs">
								Dispute Reason
							</Text>
							<Text size="sm">{selectedDispute.reason}</Text>
						</div>

						{(selectedDispute.supervisorDecision || selectedDispute.qaManagerDecision) && (
							<>
								<Divider />

								<SimpleGrid cols={2}>
									{selectedDispute.supervisorDecision && (
										<div>
											<Text fw={600} size="sm">
												Supervisor Decision
											</Text>
											<Badge color={getSupervisorDecisionColor(selectedDispute.supervisorDecision)} size="lg">
												{selectedDispute.supervisorDecision}
											</Badge>
										</div>
									)}
									{selectedDispute.qaManagerDecision && (
										<div>
											<Text fw={600} size="sm">
												QA Manager Decision
											</Text>
											<Badge color={getQAManagerDecisionColor(selectedDispute.qaManagerDecision)} size="lg">
												{selectedDispute.qaManagerDecision}
											</Badge>
										</div>
									)}
								</SimpleGrid>
							</>
						)}

						<Divider />

						<div>
							<Text fw={600} size="sm" mb="xs">
								Discussion History
							</Text>
							<Timeline active={selectedDispute.comments.length} bulletSize={24} lineWidth={2}>
								{selectedDispute.comments.map((comment) => (
									<Timeline.Item key={comment.id} bullet={<IconMessage size={12} />} title={`${comment.author} (${comment.authorRole})`}>
										<Text size="xs" c="dimmed" mb="xs">
											{new Date(comment.timestamp).toLocaleString()}
										</Text>
										<Text size="sm">
											{comment.content}
										</Text>
									</Timeline.Item>
								))}
							</Timeline>
						</div>

						<div>
							<Text fw={600} size="sm" mb="xs">
								Add Comment
							</Text>
							<Textarea placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.currentTarget.value)} rows={3} />
							<Button size="xs" mt="xs" onClick={handleAddComment}>
								Post Comment
							</Button>
						</div>

						{selectedDispute.status !== 'RESOLVED' && (
							<>
								<Divider />

								<div>
									<Text fw={600} size="sm" mb="xs">
										{currentUserRole === 'SUPERVISOR' ? 'Supervisor Decision' : 'QA Manager Decision'}
									</Text>

									<Select
										label={currentUserRole === 'SUPERVISOR' ? 'Your Decision' : 'Final Decision'}
										placeholder={currentUserRole === 'SUPERVISOR' ? 'Approve, Reject, or Escalate' : 'Approve, Reject, or Mark for Review'}
										data={
											currentUserRole === 'SUPERVISOR'
												? [
														{ value: 'APPROVED', label: 'Approve - Accept agent dispute' },
														{ value: 'REJECTED', label: 'Reject - Uphold original score' },
														{ value: 'ESCALATED', label: 'Escalate - Send to QA Manager' },
													]
												: [
														{ value: 'APPROVED', label: 'Approve - Accept agent dispute' },
														{ value: 'REJECTED', label: 'Reject - Uphold original score' },
														{ value: 'REQUIRES_REVIEW', label: 'Requires Review - Request more info' },
													]
										}
										value={selectedDecision}
										onChange={(value) => setSelectedDecision(value || '')}
									/>

									<Textarea label="Decision Reason" placeholder="Explain your decision..." value={decisionText} onChange={(e) => setDecisionText(e.currentTarget.value)} rows={3} mt="sm" />

									<Group justify="flex-end" mt="md">
										<Button variant="light" onClick={() => setIsDetailModalOpen(false)}>
											Cancel
										</Button>
										<Button
											leftSection={<IconCheck size={16} />}
											onClick={currentUserRole === 'SUPERVISOR' ? handleMakeSupervisorDecision : handleMakeQAManagerDecision}
											disabled={!selectedDecision}
										>
											Submit Decision
										</Button>
									</Group>
								</div>
							</>
						)}
					</Stack>
				)}
			</Modal>
		</Stack>
	);
};
