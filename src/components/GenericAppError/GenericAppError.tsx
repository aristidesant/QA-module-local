import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import {
	IconAlertTriangle,
	IconCloudUpload,
	IconLock,
	IconMapOff,
	IconRefresh,
	IconServerOff,
	IconUserOff,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './GenericAppError.module.css';

export type AppErrorVariant =
	| 'notFound'
	| 'forbidden'
	| 'unauthorized'
	| 'serverError'
	| 'update'
	| 'generic';

export interface GenericAppErrorProps {
	variant?: AppErrorVariant;
	title?: string;
	description?: string;
	pathname?: string;
	routeId?: string;
	statusCode?: number;
	statusText?: string;
	onRetry?: () => void;
}

type VariantConfig = {
	icon: React.ComponentType<{ size: number; stroke: number }>;
	color: 'error' | 'info' | 'warning';
	badgeColor: string;
	titleKey: string;
	descriptionKey: string;
	hintKey?: string;
	ctaKey: string;
	ctaAction: 'reload' | 'home' | 'login';
	showContext: boolean;
};

const VARIANT_CONFIG: Record<AppErrorVariant, VariantConfig> = {
	notFound: {
		icon: IconMapOff,
		color: 'info',
		badgeColor: 'blue',
		titleKey: 'appError.notFound.title',
		descriptionKey: 'appError.notFound.description',
		ctaKey: 'appError.goHomeButton',
		ctaAction: 'home',
		showContext: true,
	},
	forbidden: {
		icon: IconLock,
		color: 'warning',
		badgeColor: 'yellow',
		titleKey: 'appError.forbidden.title',
		descriptionKey: 'appError.forbidden.description',
		ctaKey: 'appError.goHomeButton',
		ctaAction: 'home',
		showContext: true,
	},
	unauthorized: {
		icon: IconUserOff,
		color: 'warning',
		badgeColor: 'yellow',
		titleKey: 'appError.unauthorized.title',
		descriptionKey: 'appError.unauthorized.description',
		ctaKey: 'appError.signInButton',
		ctaAction: 'login',
		showContext: false,
	},
	serverError: {
		icon: IconServerOff,
		color: 'error',
		badgeColor: 'red',
		titleKey: 'appError.serverError.title',
		descriptionKey: 'appError.serverError.description',
		ctaKey: 'appError.retryButton',
		ctaAction: 'reload',
		showContext: true,
	},
	update: {
		icon: IconCloudUpload,
		color: 'info',
		badgeColor: 'blue',
		titleKey: 'appError.update.title',
		descriptionKey: 'appError.update.description',
		hintKey: 'appError.update.hint',
		ctaKey: 'appError.reloadButton',
		ctaAction: 'reload',
		showContext: false,
	},
	generic: {
		icon: IconAlertTriangle,
		color: 'error',
		badgeColor: 'red',
		titleKey: 'appError.title',
		descriptionKey: 'appError.description',
		hintKey: 'appError.updateHint',
		ctaKey: 'appError.retryButton',
		ctaAction: 'reload',
		showContext: true,
	},
};

const GenericAppError = ({
	variant = 'generic',
	title,
	description,
	pathname,
	routeId,
	statusCode,
	statusText,
	onRetry,
}: GenericAppErrorProps) => {
	const { t } = useTranslation('common');
	const config = VARIANT_CONFIG[variant];
	const Icon = config.icon;

	const displayTitle = title ?? t(config.titleKey);
	const displayDescription = description ?? t(config.descriptionKey);
	const hintText = config.hintKey ? t(config.hintKey) : null;

	const hasStatus = Boolean(statusCode || statusText);
	const showContext = config.showContext && (pathname || routeId || hasStatus);

	const handleCta =
		onRetry ??
		(() => {
			if (config.ctaAction === 'reload') {
				window.location.reload();
			} else if (config.ctaAction === 'home') {
				window.location.href = '/';
			} else if (config.ctaAction === 'login') {
				window.location.href = '/login';
			}
		});

	return (
		<main className={styles.page}>
			<section className={styles.panel} aria-labelledby='app-error-title'>
				<Stack gap='md' align='center'>
					<img src='/images/logo-2.png' alt='Newtech' className={styles.logo} />

					<div
						className={styles.iconShell}
						data-color={config.color}
						aria-hidden='true'
					>
						<Icon size={34} stroke={2} />
					</div>

					<Stack gap='xs' align='center' className={styles.copy}>
						<Title id='app-error-title' order={1} className={styles.title}>
							{displayTitle}
						</Title>
						<Text className={styles.description}>{displayDescription}</Text>
						{hintText && <Text className={styles.hint}>{hintText}</Text>}
					</Stack>

					{showContext && (
						<Stack gap='xs' className={styles.context}>
							{pathname && (
								<Group justify='space-between' gap='md' wrap='nowrap'>
									<Text className={styles.contextLabel}>
										{t('appError.pageLabel')}
									</Text>
									<Text className={styles.contextValue}>{pathname}</Text>
								</Group>
							)}
							{routeId && (
								<Group justify='space-between' gap='md' wrap='nowrap'>
									<Text className={styles.contextLabel}>
										{t('appError.routeLabel')}
									</Text>
									<Text className={styles.contextValue}>{routeId}</Text>
								</Group>
							)}
							{hasStatus && (
								<Group justify='space-between' gap='md' wrap='nowrap'>
									<Text className={styles.contextLabel}>
										{t('appError.statusLabel')}
									</Text>
									<Badge
										variant='light'
										color={config.badgeColor}
										className={styles.statusBadge}
									>
										{[statusCode, statusText].filter(Boolean).join(' ')}
									</Badge>
								</Group>
							)}
						</Stack>
					)}

					<Button
						leftSection={<IconRefresh size={16} />}
						onClick={handleCta}
						className={styles.cta}
						color={
							variant === 'update' || variant === 'notFound'
								? 'blue'
								: undefined
						}
					>
						{t(config.ctaKey)}
					</Button>
				</Stack>
			</section>
		</main>
	);
};

export default GenericAppError;
