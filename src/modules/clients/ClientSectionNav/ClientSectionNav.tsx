import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, Select } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import type {
	ClientFormSectionId,
	ClientFormSectionItem,
} from '~/modules/clients/ClientForm/ClientForm.types';
import classes from './ClientSectionNav.module.css';

interface ClientSectionNavProps {
	sections: ClientFormSectionItem[];
	ariaLabel: string;
	jumpLabel: string;
	errorLabel: string;
}

type VerticalScrollContainer = HTMLElement | Window;

const SCROLL_END_TOLERANCE = 2;

const getVerticalScrollContainer = (
	element: HTMLElement
): VerticalScrollContainer => {
	let parent = element.parentElement;

	while (parent) {
		const overflowY = window.getComputedStyle(parent).overflowY;

		if (
			(overflowY === 'auto' ||
				overflowY === 'scroll' ||
				overflowY === 'overlay') &&
			parent.scrollHeight > parent.clientHeight
		) {
			return parent;
		}

		parent = parent.parentElement;
	}

	return window;
};

const isScrollContainerAtBottom = (
	container: VerticalScrollContainer
): boolean => {
	if (container instanceof HTMLElement) {
		const maxScrollTop = container.scrollHeight - container.clientHeight;

		return (
			maxScrollTop > SCROLL_END_TOLERANCE &&
			container.scrollTop >= maxScrollTop - SCROLL_END_TOLERANCE
		);
	}

	const scrollHeight = Math.max(
		document.documentElement.scrollHeight,
		document.body.scrollHeight
	);
	const maxScrollTop = scrollHeight - window.innerHeight;

	return (
		maxScrollTop > SCROLL_END_TOLERANCE &&
		window.scrollY >= maxScrollTop - SCROLL_END_TOLERANCE
	);
};

const ClientSectionNav = ({
	sections,
	ariaLabel,
	jumpLabel,
	errorLabel,
}: ClientSectionNavProps) => {
	const [activeSection, setActiveSection] =
		useState<ClientFormSectionId | null>(sections[0]?.id ?? null);
	const reducedMotion = useReducedMotion();
	const sectionIdsKey = sections.map((section) => section.id).join('|');
	const sectionIds = useMemo(
		() =>
			(sectionIdsKey ? sectionIdsKey.split('|') : []) as ClientFormSectionId[],
		[sectionIdsKey]
	);

	const sectionById = useMemo(
		() => new Map(sections.map((section) => [section.id, section])),
		[sections]
	);

	useEffect(() => {
		setActiveSection((currentSection) =>
			currentSection && sectionIds.includes(currentSection)
				? currentSection
				: (sectionIds[0] ?? null)
		);
	}, [sectionIds]);

	useEffect(() => {
		const visibleSections = new Map<string, IntersectionObserverEntry>();
		const elements = sectionIds
			.map((sectionId) => document.getElementById(sectionId))
			.filter((element): element is HTMLElement => element !== null);
		const validSectionIds = new Set(sectionIds);

		if (elements.length === 0) {
			return;
		}

		const scrollContainer = getVerticalScrollContainer(elements[0]);
		const lastElement = elements[elements.length - 1];
		let animationFrame: number | null = null;

		const updateActiveSection = () => {
			if (lastElement && isScrollContainerAtBottom(scrollContainer)) {
				setActiveSection(lastElement.id as ClientFormSectionId);
				return;
			}

			const nearestVisibleSection = [...visibleSections.values()].sort(
				(a, b) =>
					Math.abs(a.boundingClientRect.top) -
					Math.abs(b.boundingClientRect.top)
			)[0];
			const activationLine = window.innerHeight * 0.15;
			const nearestFallbackElement = elements.reduce<HTMLElement | undefined>(
				(nearest, element) => {
					if (!nearest) {
						return element;
					}

					const elementDistance = Math.abs(
						element.getBoundingClientRect().top - activationLine
					);
					const nearestDistance = Math.abs(
						nearest.getBoundingClientRect().top - activationLine
					);

					return elementDistance < nearestDistance ? element : nearest;
				},
				undefined
			);
			const nearestSectionId = (
				nearestVisibleSection?.target ?? nearestFallbackElement
			)?.id as ClientFormSectionId | undefined;

			if (nearestSectionId && validSectionIds.has(nearestSectionId)) {
				setActiveSection(nearestSectionId);
			}
		};

		const scheduleActiveSectionUpdate = () => {
			if (animationFrame !== null) {
				return;
			}

			animationFrame = window.requestAnimationFrame(() => {
				animationFrame = null;
				updateActiveSection();
			});
		};

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visibleSections.set(entry.target.id, entry);
					} else {
						visibleSections.delete(entry.target.id);
					}
				});

				updateActiveSection();
			},
			{
				rootMargin: '-15% 0px -70% 0px',
				threshold: [0, 0.25, 0.5],
			}
		);

		elements.forEach((element) => observer.observe(element));
		scrollContainer.addEventListener('scroll', scheduleActiveSectionUpdate, {
			passive: true,
		});
		updateActiveSection();

		return () => {
			observer.disconnect();
			scrollContainer.removeEventListener(
				'scroll',
				scheduleActiveSectionUpdate
			);

			if (animationFrame !== null) {
				window.cancelAnimationFrame(animationFrame);
			}
		};
	}, [sectionIds]);

	const navigateToSection = useCallback(
		(sectionId: ClientFormSectionId) => {
			const section = document.getElementById(sectionId);

			if (!section) {
				return;
			}

			setActiveSection(sectionId);
			section.scrollIntoView({
				behavior: reducedMotion ? 'auto' : 'smooth',
				block: 'start',
			});
			section.focus({ preventScroll: true });
		},
		[reducedMotion]
	);

	const activeSectionItem = activeSection
		? sectionById.get(activeSection)
		: undefined;
	const ActiveIcon = activeSectionItem?.icon;

	return (
		<>
			<nav className={classes.desktopNav} aria-label={ariaLabel}>
				{sections.map((section) => {
					const SectionIcon = section.icon;
					const isActive = section.id === activeSection;

					return (
						<NavLink
							key={section.id}
							component='button'
							type='button'
							label={section.label}
							leftSection={<SectionIcon size={18} aria-hidden='true' />}
							rightSection={
								section.hasError ? (
									<IconAlertCircle
										size={18}
										className={classes.errorIcon}
										aria-label={errorLabel}
										role='img'
									/>
								) : undefined
							}
							active={isActive}
							variant='light'
							aria-current={isActive ? 'location' : undefined}
							className={classes.navLink}
							onClick={() => navigateToSection(section.id)}
						/>
					);
				})}
			</nav>

			<div className={classes.mobileSelect}>
				<Select
					label={jumpLabel}
					aria-label={jumpLabel}
					value={activeSection}
					data={sections.map((section) => ({
						value: section.id,
						label: section.label,
					}))}
					allowDeselect={false}
					disabled={sections.length === 0}
					leftSection={
						activeSectionItem?.hasError ? (
							<IconAlertCircle
								size={18}
								className={classes.errorIcon}
								aria-label={errorLabel}
								role='img'
							/>
						) : ActiveIcon ? (
							<ActiveIcon size={18} aria-hidden='true' />
						) : undefined
					}
					renderOption={({ option }) => {
						const section = sectionById.get(
							option.value as ClientFormSectionId
						);

						if (!section) {
							return option.label;
						}

						const SectionIcon = section.icon;

						return (
							<div className={classes.option}>
								<SectionIcon size={18} aria-hidden='true' />
								<span className={classes.optionLabel}>{option.label}</span>
								{section.hasError && (
									<IconAlertCircle
										size={18}
										className={classes.errorIcon}
										aria-label={errorLabel}
										role='img'
									/>
								)}
							</div>
						);
					}}
					onChange={(value) => {
						if (value && sectionById.has(value)) {
							navigateToSection(value as ClientFormSectionId);
						}
					}}
				/>
			</div>
		</>
	);
};

export default ClientSectionNav;
