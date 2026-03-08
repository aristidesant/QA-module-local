import { Fragment } from 'react';
import { Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	renderCardActionButton,
	resolveCardActions,
} from './CardHeaderActions.helpers';
import type { CardActionProps } from './CardHeaderActions.types';

const CardHeaderActions: React.FC<CardActionProps> = ({
	actions,
	headerExtras,
	headerActions,
	onAdd,
	onEdit,
	onChange,
	onView,
	onConfigure,
	onOpenSettings,
	onExpand,
	onCalculate,
	onRefresh,
}) => {
	const { t } = useTranslation('common');
	const resolvedActions = resolveCardActions({
		actions,
		headerExtras,
		headerActions,
		onAdd,
		onEdit,
		onChange,
		onView,
		onConfigure,
		onOpenSettings,
		onExpand,
		onCalculate,
		onRefresh,
	});

	if (!headerExtras && !headerActions && !resolvedActions) {
		return null;
	}

	return (
		<Group gap='xs' wrap='nowrap'>
			{headerExtras ? <Fragment>{headerExtras}</Fragment> : null}
			{resolvedActions?.secondary?.map((action) =>
				renderCardActionButton(action, 'secondary', t)
			)}
			{resolvedActions?.primary
				? renderCardActionButton(resolvedActions.primary, 'primary', t)
				: null}
			{headerActions ? <Fragment>{headerActions}</Fragment> : null}
		</Group>
	);
};

export default CardHeaderActions;
