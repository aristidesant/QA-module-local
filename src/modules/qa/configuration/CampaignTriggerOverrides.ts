import type { TriggerConfiguration, TriggerConfigScope } from '~/models/qa';

export interface CampaignOverride {
	id: number;
	campaignId: number;
	globalTriggerId: number;
	overriddenTrigger: TriggerConfiguration;
	overrideReason?: string;
	overriddenAt: Date;
	overriddenBy: number; // QA Manager ID
	status: 'ACTIVE' | 'INACTIVE';
}

export interface CampaignTriggerResolution {
	globalTrigger?: TriggerConfiguration;
	campaignOverride?: CampaignOverride;
	effectiveTrigger: TriggerConfiguration;
	source: 'GLOBAL' | 'CAMPAIGN_OVERRIDE';
}

export class CampaignTriggerOverrideManager {
	private overrides: Map<number, CampaignOverride> = new Map();
	private nextId: number = 1;

	/**
	 * Create a campaign-specific trigger override
	 */
	createOverride(
		campaignId: number,
		globalTriggerId: number,
		overriddenTrigger: TriggerConfiguration,
		overrideReason: string,
		overriddenBy: number,
	): CampaignOverride {
		const override: CampaignOverride = {
			id: this.nextId++,
			campaignId,
			globalTriggerId,
			overriddenTrigger,
			overrideReason,
			overriddenAt: new Date(),
			overriddenBy,
			status: 'ACTIVE',
		};

		this.overrides.set(override.id, override);
		return override;
	}

	/**
	 * Deactivate an override (revert to global)
	 */
	deactivateOverride(overrideId: number): boolean {
		const override = this.overrides.get(overrideId);
		if (override) {
			override.status = 'INACTIVE';
			return true;
		}
		return false;
	}

	/**
	 * Delete an override entirely
	 */
	deleteOverride(overrideId: number): boolean {
		return this.overrides.delete(overrideId);
	}

	/**
	 * Resolve effective trigger for a campaign
	 * Returns global trigger if no override, otherwise returns override
	 */
	resolveEffectiveTrigger(
		campaignId: number,
		globalTriggerId: number,
		globalTrigger: TriggerConfiguration,
	): CampaignTriggerResolution {
		const override = this.getActiveOverride(campaignId, globalTriggerId);

		if (override) {
			return {
				globalTrigger,
				campaignOverride: override,
				effectiveTrigger: override.overriddenTrigger,
				source: 'CAMPAIGN_OVERRIDE',
			};
		}

		return {
			globalTrigger,
			effectiveTrigger: globalTrigger,
			source: 'GLOBAL',
		};
	}

	/**
	 * Get active override for a campaign-trigger pair
	 */
	private getActiveOverride(campaignId: number, globalTriggerId: number): CampaignOverride | null {
		const override = Array.from(this.overrides.values()).find(
			(o) => o.campaignId === campaignId && o.globalTriggerId === globalTriggerId && o.status === 'ACTIVE',
		);
		return override || null;
	}

	/**
	 * Get all active overrides for a campaign
	 */
	getCampaignOverrides(campaignId: number): CampaignOverride[] {
		return Array.from(this.overrides.values())
			.filter((o) => o.campaignId === campaignId && o.status === 'ACTIVE')
			.sort((a, b) => b.overriddenAt.getTime() - a.overriddenAt.getTime());
	}

	/**
	 * Get all overrides for a global trigger across all campaigns
	 */
	getGlobalTriggerOverrides(globalTriggerId: number): CampaignOverride[] {
		return Array.from(this.overrides.values())
			.filter((o) => o.globalTriggerId === globalTriggerId && o.status === 'ACTIVE')
			.sort((a, b) => b.overriddenAt.getTime() - a.overriddenAt.getTime());
	}

	/**
	 * Get override history for auditing
	 */
	getOverrideHistory(campaignId: number, globalTriggerId: number): CampaignOverride[] {
		return Array.from(this.overrides.values())
			.filter((o) => o.campaignId === campaignId && o.globalTriggerId === globalTriggerId)
			.sort((a, b) => b.overriddenAt.getTime() - a.overriddenAt.getTime());
	}

	/**
	 * Check if campaign has override for a specific global trigger
	 */
	hasOverride(campaignId: number, globalTriggerId: number): boolean {
		return this.getActiveOverride(campaignId, globalTriggerId) !== null;
	}

	/**
	 * Get override statistics for a campaign
	 */
	getCampaignOverrideStats(campaignId: number): {
		totalGlobalTriggers: number;
		overriddenCount: number;
		overridePercentage: number;
	} {
		const overrides = this.getCampaignOverrides(campaignId);
		const uniqueGlobalTriggers = new Set(overrides.map((o) => o.globalTriggerId)).size;

		return {
			totalGlobalTriggers: uniqueGlobalTriggers,
			overriddenCount: overrides.length,
			overridePercentage: uniqueGlobalTriggers > 0 ? (overrides.length / uniqueGlobalTriggers) * 100 : 0,
		};
	}

	/**
	 * Bulk resolve effective triggers for a campaign
	 */
	resolveEffectiveTriggersForCampaign(
		campaignId: number,
		globalTriggers: TriggerConfiguration[],
	): CampaignTriggerResolution[] {
		return globalTriggers.map((globalTrigger) =>
			this.resolveEffectiveTrigger(campaignId, globalTrigger.id, globalTrigger),
		);
	}

	/**
	 * Get overrides that need attention (recently modified)
	 */
	getRecentOverrides(days: number = 7): CampaignOverride[] {
		const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
		return Array.from(this.overrides.values())
			.filter((o) => o.overriddenAt >= cutoffDate && o.status === 'ACTIVE')
			.sort((a, b) => b.overriddenAt.getTime() - a.overriddenAt.getTime());
	}
}
