import React from 'react';
import { Flex } from '@mantine/core';
import * as icons from '@tabler/icons-react';
import type { JSX } from 'react';

export default function getIcon(
	iconName?: string,
	props?: icons.IconProps
): JSX.Element {
	if (!iconName) {
		return <icons.IconHelpCircle {...props} />;
	}

	const names = iconName.split(',').map((name) => name.trim());
	if (names.length > 1) {
		return (
			<Flex align='center' gap={1}>
				{names.map((name) => (
					<React.Fragment key={name}>{getIcon(name, props)}</React.Fragment>
				))}
			</Flex>
		);
	}

	// Single icon
	const name = names[0];
	// @ts-expect-error: iconName is a key of icons
	const IconComponent = icons[name] as React.FC<{}> | undefined;
	const DefaultIconComponent = icons.IconHelpCircle;

	return IconComponent ? (
		<IconComponent key={`${name}-${Date.now()}`} {...props} />
	) : (
		<DefaultIconComponent key={`default-${Date.now()}`} {...props} />
	);
}
