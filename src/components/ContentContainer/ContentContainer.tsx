import { type ReactNode } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import styles from './ContentContainer.module.css';
import { Divider, Text, Title, ActionIcon, Tooltip, Flex } from '@mantine/core';

export interface ContentContainerProps {
	children: ReactNode;
	rightSection?: ReactNode;
	title?: ReactNode;
	titleRight?: ReactNode;
	titleIcon?: ReactNode;
	description?: string;
	showBackButton?: boolean;
	rightSectionTitle?: ReactNode;
	mainScroll?: boolean; // new prop to control left/main scroll
	contentWidth?: 'centered' | 'full';

	onBackClick?: () => void;
}

export const ContentContainer = ({
	children,
	rightSection,
	title,
	description,
	showBackButton = false,
	rightSectionTitle,
	titleRight,
	mainScroll = true,
	contentWidth = 'centered',
	titleIcon,
	onBackClick,
}: ContentContainerProps) => {
	const widthClassName =
		contentWidth === 'full'
			? styles.contentWidthFull
			: styles.contentWidthCentered;

	return (
		<div className={styles.contentContainer}>
			<div className={styles.contentContainerMain}>
				{(title || description || showBackButton) && (
					<div className={styles.contentContainerHeader}>
						<div
							className={`${styles.contentContainerInner} ${widthClassName}`}
						>
							<Flex gap={'xs'} align={'center'} justify={'space-between'}>
								<Flex gap={'xs'} align={'center'}>
									{showBackButton && (
										<Tooltip label='Back' position='bottom' withArrow>
											<ActionIcon
												variant='light'
												color='gray'
												aria-label='Back'
												onClick={onBackClick}
												size='lg'
											>
												<IconArrowLeft size={20} />
											</ActionIcon>
										</Tooltip>
									)}
									{(title || description) && (
										<Flex direction={'column'}>
											{title && (
												<Flex align='center' gap='xs'>
													{titleIcon}
													<Title
														order={5}
														className={styles.contentContainerTitle}
													>
														{title}
													</Title>
												</Flex>
											)}
											{description && (
												<Text
													fz='xs'
													className={styles.contentContainerDescription}
												>
													{description}
												</Text>
											)}
										</Flex>
									)}
								</Flex>
								{titleRight && titleRight}
							</Flex>
							<Divider mt='xs' className={styles.contentContainerDivider} />
						</div>
					</div>
				)}
				<div
					className={`${styles.contentContainerContent} ${!mainScroll ? styles.contentContainerNoMainScroll : ''}`}
				>
					<div className={`${styles.contentContainerInner} ${widthClassName}`}>
						{children}
					</div>
				</div>
			</div>
			{rightSection && (
				<aside className={styles.contentContainerRightSection}>
					{rightSectionTitle && <div>{rightSectionTitle}</div>}
					<div>{rightSection}</div>
				</aside>
			)}
		</div>
	);
};

export default ContentContainer;
