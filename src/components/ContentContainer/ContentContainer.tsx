import { type ReactNode, useState, useRef, useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import styles from './ContentContainer.module.css';
import { Divider, Text, Title, ActionIcon, Tooltip, Flex } from '@mantine/core';

export interface ContentContainerProps {
	children: ReactNode;
	rightSection?: ReactNode;
	title?: ReactNode;
	titleRight?: ReactNode;
	titleBottom?: ReactNode;
	titleIcon?: ReactNode;
	description?: string;
	showBackButton?: boolean;
	rightSectionTitle?: ReactNode;
	mainScroll?: boolean; // new prop to control left/main scroll
	contentClassName?: string;
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
	titleBottom,
	mainScroll = true,
	contentWidth = 'centered',
	contentClassName,
	titleIcon,
	onBackClick,
}: ContentContainerProps) => {
	const widthClassName =
		contentWidth === 'full'
			? styles.contentWidthFull
			: styles.contentWidthCentered;

	const [scrolled, setScrolled] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!mainScroll) return; // shadow always-on for mainScroll=false (handled via prop)
		const sentinel = sentinelRef.current;
		const root = scrollContainerRef.current;
		if (!sentinel || !root) return;
		const observer = new IntersectionObserver(
			([entry]) => setScrolled(!entry.isIntersecting),
			{ root, threshold: 0 }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [mainScroll]);

	return (
		<div className={styles.contentContainer}>
			<div className={styles.contentContainerMain}>
				{(title || description || showBackButton) && (
					<div
						className={`${styles.contentContainerHeader} ${scrolled || !mainScroll ? styles.contentContainerHeaderScrolled : ''}`}
					>
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
							{titleBottom ? (
								<div className={styles.contentContainerHeaderBottom}>
									{titleBottom}
								</div>
							) : null}
						</div>
						<Divider mt='xs' className={styles.contentContainerDivider} />
					</div>
				)}
				<div
					ref={scrollContainerRef}
					className={`${styles.contentContainerContent} ${!mainScroll ? styles.contentContainerNoMainScroll : ''} ${contentClassName ?? ''}`}
				>
					{/* inline-style-allow: sentinel element requires exact 1px height for IntersectionObserver; no CSS class alternative is reliable */}
					<div ref={sentinelRef} style={{ height: 1 }} aria-hidden />
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
