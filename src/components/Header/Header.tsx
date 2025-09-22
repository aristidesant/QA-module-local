import { IconBell, IconMenu2, IconX, IconArrowBack } from '@tabler/icons-react';
import { ActionIcon, Divider, Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import UserMenu from '../UserMenu';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useEndImpersonation } from '~/queries/authQueries';
import styles from './Header.module.css';

interface HeaderProps {
	opened: boolean;
	toggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ opened, toggle }) => {
	const { isImpersonating } = useImpersonationState();
	const endImpersonationMutation = useEndImpersonation();

	const handleReturnToMasterClient = () => {
		modals.openConfirmModal({
			title: 'Return to Master Client',
			children: (
				<Text size='sm'>
					Are you sure you want to return to your master client account? You
					will exit the current client impersonation session.
				</Text>
			),
			labels: { confirm: 'Return to Master', cancel: 'Cancel' },
			confirmProps: { color: 'blue' },
			onConfirm: () => {
				endImpersonationMutation.mutate();
			},
		});
	};

	return (
		<header className={styles.header}>
			<div className={styles.headerContent}>
				<div className={styles.headerLeft}>
					<button
						className={styles.burger}
						onClick={toggle}
						aria-label={opened ? 'Close menu' : 'Open menu'}
						aria-pressed={opened}
						type='button'
					>
						{opened ? <IconX size={24} /> : <IconMenu2 size={24} />}
					</button>
					{/* Add space between burger and any future navigation items */}
					<div style={{ width: '2rem' }} />
				</div>
				<div className={styles.headerRight}>
					{isImpersonating && (
						<>
							<Button
								variant='outline'
								size='xs'
								leftSection={<IconArrowBack size={16} />}
								onClick={handleReturnToMasterClient}
								className={styles.returnButton}
							>
								Return to Master Client
							</Button>
							<Divider orientation='vertical' />
						</>
					)}
					<ActionIcon radius={'xl'} size={'lg'} variant='subtle'>
						<IconBell />
					</ActionIcon>
					<Divider orientation='vertical' />
					<UserMenu />
				</div>
			</div>
		</header>
	);
};
