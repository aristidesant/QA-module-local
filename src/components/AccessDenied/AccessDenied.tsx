import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, Flex, Stack, Text, Title } from '@mantine/core';
import { IconBan } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './AccessDenied.module.css';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

export interface AccessDeniedProps {
	title?: string;
	description?: string;
	showBackButton?: boolean;
	onBackClick?: () => void;
}

const AccessDenied = ({
	title,
	description,
	showBackButton = true,
	onBackClick,
}: AccessDeniedProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const displayTitle = title ?? t('accessDenied.title');
	const displayDescription = description ?? t('accessDenied.description');

	const handleBack = useMemo(
		() => onBackClick ?? (() => navigate(-1)),
		[onBackClick, navigate]
	);

	return (
		<ContentContainer
			title={displayTitle}
			description={displayDescription}
			showBackButton={showBackButton}
			onBackClick={handleBack}
		>
			<Flex justify='center' align='center' style={{ minHeight: '300px' }}>
				<Stack align='center' gap='xs'>
					<div className={styles.iconWrapper}>
						<IconBan size={42} />
					</div>
					<Title order={4} c='dark'>
						{displayTitle}
					</Title>
					<Text fz='sm' c='dimmed' ta='center' className={styles.description}>
						{displayDescription}
					</Text>
					<Flex gap='xs'>
						<Button size='sm' variant='outline' onClick={handleBack}>
							{t('common.goBack')}
						</Button>
						<Button size='sm' onClick={() => navigate('/')}>
							{t('common.goToHome')}
						</Button>
					</Flex>
				</Stack>
			</Flex>
		</ContentContainer>
	);
};

export default AccessDenied;
