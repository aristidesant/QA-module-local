import type ContactGroup from '~/models/ContactGroup';
import type { Scheduler } from '~/models/SchedulerModel';

export interface HumanEquivalentCalculations {
	/** Total human equivalent used by other contact groups */
	usageEquivalent: number;
	/** Maximum available human equivalent capacity */
	maxAvailableHumanEquivalent: number;
	/** Whether we're creating a new contact group and scheduler is full */
	isCreatingAndFull: boolean;
	/** Maximum value for the slider */
	sliderMax: number;
	/** Whether the current contact group can increase its human equivalent */
	canIncrease: boolean;
	/** Total scheduler capacity */
	totalSchedulerCapacity: number;
}

/**
 * Calculates human equivalent values for contact group management
 * @param contactGroups - Array of contact groups
 * @param activeSchedule - The active scheduler
 * @param currentContactGroupId - ID of the contact group being edited (optional)
 * @returns Object containing all calculated values
 */
export const calculateHumanEquivalentValues = (
	contactGroups: ContactGroup[],
	activeSchedule: Scheduler | null | undefined,
	currentContactGroupId?: number
): HumanEquivalentCalculations => {
	// Total scheduler capacity
	const totalSchedulerCapacity = activeSchedule?.humanEquivalent || 0;

	// Sum all humanEquivalent except the current contact group being edited
	const usageEquivalent = contactGroups.reduce((sum, group) => {
		// If editing, exclude the current contact group from the sum
		if (currentContactGroupId && group.id === currentContactGroupId) {
			return sum;
		}
		return sum + (group.humanEquivalent || 0);
	}, 0);

	// Calculate max available humanEquivalent
	const maxAvailableHumanEquivalent = Math.max(
		0,
		totalSchedulerCapacity - usageEquivalent
	);

	// Check if we're creating a new contact group and scheduler is full
	const isCreatingAndFull =
		!currentContactGroupId && maxAvailableHumanEquivalent === 0;

	// Set the slider max value
	let sliderMax: number;
	if (currentContactGroupId) {
		// When editing, use the available capacity
		sliderMax = maxAvailableHumanEquivalent;
	} else {
		// When creating, use available capacity
		sliderMax = Math.max(1, maxAvailableHumanEquivalent);
	}

	// Check if can increase (only relevant when editing)
	const canIncrease = currentContactGroupId
		? maxAvailableHumanEquivalent > 0
		: true;

	return {
		usageEquivalent,
		maxAvailableHumanEquivalent,
		isCreatingAndFull,
		sliderMax,
		canIncrease,
		totalSchedulerCapacity,
	};
};
