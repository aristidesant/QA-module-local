import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, Flex, Stack, Text, Title } from '@mantine/core';
import { IconBan } from '@tabler/icons-react';
import styles from './AccessDenied.module.css';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

export interface AccessDeniedProps {
	title?: string;
	description?: string;
	showBackButton?: boolean;
	onBackClick?: () => void;
}

const AccessDenied = ({
	title = 'Access Denied',
	description = 'You do not have permission to access this page.',
	showBackButton = true,
	onBackClick,
}: AccessDeniedProps) => {
	const navigate = useNavigate();

	const handleBack = useMemo(
		() => onBackClick ?? (() => navigate(-1)),
		[onBackClick, navigate]
	);

	return (
		<ContentContainer
			title={title}
			description={description}
			showBackButton={showBackButton}
			onBackClick={handleBack}
		>
			<Flex justify='center' align='center' style={{ minHeight: '300px' }}>
				<Stack align='center' gap='xs'>
					<div className={styles.iconWrapper}>
						<IconBan size={42} />
					</div>
					<Title order={4} c='dark'>
						{title}
					</Title>
					<Text fz='sm' c='dimmed' ta='center' className={styles.description}>
						{description}
					</Text>
					<Flex gap='xs'>
						<Button size='sm' variant='outline' onClick={handleBack}>
							Go Back
						</Button>
						<Button size='sm' onClick={() => navigate('/')}>
							Go to Home
						</Button>
					</Flex>
				</Stack>
			</Flex>
		</ContentContainer>
	);
};

export default AccessDenied;
