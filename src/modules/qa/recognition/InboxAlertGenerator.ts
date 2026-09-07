export type AlertType =
	| 'PERFORMANCE_DROP'
	| 'COMPLIANCE_VIOLATION'
	| 'AUTO_FAIL_TRIGGERED'
	| 'RANKING_CHANGE'
	| 'RECOGNITION_RECEIVED'
	| 'BADGE_EARNED'
	| 'TEAM_UPDATE'
	| 'MILESTONE_ACHIEVED';

export interface InboxAlert {
	id: number;
	agentId: number;
	type: AlertType;
	title: string;
	message: string;
	relatedEntityId?: number; // ID of evaluation, ranking, etc.
	severity: 'low' | 'medium' | 'high' | 'critical';
	isRead: boolean;
	createdAt: Date;
	actionUrl?: string;
	metadata?: Record<string, any>;
}

export interface AlertEvent {
	type: AlertType;
	agentId: number;
	data: Record<string, any>;
}

export class InboxAlertGenerator {
	private alerts: Map<number, InboxAlert> = new Map();
	private nextAlertId: number = 1;

	/**
	 * Generate alert from an event
	 */
	generateAlert(event: AlertEvent): InboxAlert {
		const alert = this.createAlert(event);
		this.alerts.set(alert.id, alert);
		return alert;
	}

	private createAlert(event: AlertEvent): InboxAlert {
		switch (event.type) {
			case 'PERFORMANCE_DROP':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'PERFORMANCE_DROP',
					title: 'Performance Alert',
					message: `Your QA score has dropped to ${event.data.currentScore}%. Previous: ${event.data.previousScore}%`,
					severity: event.data.currentScore < 75 ? 'high' : 'medium',
					isRead: false,
					createdAt: new Date(),
					relatedEntityId: event.data.evaluationId,
					metadata: event.data,
				};

			case 'COMPLIANCE_VIOLATION':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'COMPLIANCE_VIOLATION',
					title: 'Compliance Violation Detected',
					message: `Compliance rule "${event.data.ruleViolated}" was not followed in call ${event.data.callId}`,
					severity: 'high',
					isRead: false,
					createdAt: new Date(),
					relatedEntityId: event.data.callId,
					metadata: event.data,
				};

			case 'AUTO_FAIL_TRIGGERED':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'AUTO_FAIL_TRIGGERED',
					title: 'Auto-Fail Triggered',
					message: `Auto-fail condition was triggered for evaluation: ${event.data.autoFailType}`,
					severity: 'critical',
					isRead: false,
					createdAt: new Date(),
					relatedEntityId: event.data.evaluationId,
					metadata: event.data,
				};

			case 'RANKING_CHANGE':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'RANKING_CHANGE',
					title: 'Ranking Update',
					message: `You moved from position ${event.data.previousRank} to ${event.data.newRank} in ${event.data.rankingName}`,
					severity: event.data.newRank <= 3 ? 'high' : 'low',
					isRead: false,
					createdAt: new Date(),
					relatedEntityId: event.data.rankingId,
					metadata: event.data,
				};

			case 'RECOGNITION_RECEIVED':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'RECOGNITION_RECEIVED',
					title: 'You Got a Reaction!',
					message: `${event.data.givenByName} gave you a "${event.data.reactionType}" reaction`,
					severity: 'low',
					isRead: false,
					createdAt: new Date(),
					relatedEntityId: event.data.reactionId,
					metadata: event.data,
				};

			case 'BADGE_EARNED':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'BADGE_EARNED',
					title: 'Badge Earned!',
					message: `Congratulations! You earned the "${event.data.badgeName}" badge: ${event.data.badgeDescription}`,
					severity: 'medium',
					isRead: false,
					createdAt: new Date(),
					relatedEntityId: event.data.badgeId,
					metadata: event.data,
				};

			case 'TEAM_UPDATE':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'TEAM_UPDATE',
					title: 'Team Update',
					message: event.data.message,
					severity: 'low',
					isRead: false,
					createdAt: new Date(),
					metadata: event.data,
				};

			case 'MILESTONE_ACHIEVED':
				return {
					id: this.nextAlertId++,
					agentId: event.agentId,
					type: 'MILESTONE_ACHIEVED',
					title: 'Milestone Achieved!',
					message: `Congratulations! You reached ${event.data.milestoneDescription}`,
					severity: 'medium',
					isRead: false,
					createdAt: new Date(),
					metadata: event.data,
				};

			default:
				throw new Error(`Unknown alert type: ${event.type}`);
		}
	}

	/**
	 * Get alerts for an agent
	 */
	getAgentAlerts(agentId: number, unreadOnly: boolean = false): InboxAlert[] {
		return Array.from(this.alerts.values())
			.filter((a) => a.agentId === agentId && (!unreadOnly || !a.isRead))
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	/**
	 * Mark alert as read
	 */
	markAsRead(alertId: number): boolean {
		const alert = this.alerts.get(alertId);
		if (alert) {
			alert.isRead = true;
			return true;
		}
		return false;
	}

	/**
	 * Mark multiple alerts as read
	 */
	markManyAsRead(alertIds: number[]): number {
		let count = 0;
		alertIds.forEach((id) => {
			if (this.markAsRead(id)) count++;
		});
		return count;
	}

	/**
	 * Delete an alert
	 */
	deleteAlert(alertId: number): boolean {
		return this.alerts.delete(alertId);
	}

	/**
	 * Get unread count for agent
	 */
	getUnreadCount(agentId: number): number {
		return Array.from(this.alerts.values()).filter((a) => a.agentId === agentId && !a.isRead)
			.length;
	}

	/**
	 * Get alerts by type for agent
	 */
	getAlertsByType(agentId: number, type: AlertType): InboxAlert[] {
		return Array.from(this.alerts.values())
			.filter((a) => a.agentId === agentId && a.type === type)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	/**
	 * Get critical alerts across system
	 */
	getCriticalAlerts(): InboxAlert[] {
		return Array.from(this.alerts.values())
			.filter((a) => a.severity === 'critical' && !a.isRead)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	/**
	 * Clear old alerts (older than N days)
	 */
	clearOldAlerts(daysOld: number = 90): number {
		const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
		let deletedCount = 0;

		this.alerts.forEach((alert, id) => {
			if (alert.createdAt < cutoffDate && alert.isRead) {
				this.alerts.delete(id);
				deletedCount++;
			}
		});

		return deletedCount;
	}
}
