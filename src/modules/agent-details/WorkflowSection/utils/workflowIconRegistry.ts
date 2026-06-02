import {
	IconUserCircle,
	IconPlugConnected,
	IconTool,
	IconPhoneCall,
	IconUserCog,
	IconHeadset,
	IconMessage,
	IconBrain,
	IconShield,
	IconCreditCard,
	IconCalendar,
	IconClipboardCheck,
	IconMail,
	IconBell,
	IconSearch,
	IconDatabase,
	IconLock,
	IconSettings,
	IconChartBar,
	IconWorld,
	IconHeart,
	IconStar,
	IconBolt,
	IconRocket,
	IconFlag,
	IconBook,
	IconBriefcase,
	IconTarget,
	IconClock,
	IconMapPin,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

/** Props expected by every Tabler icon component */
interface TablerIconProps {
	size?: number | string;
	className?: string;
	stroke?: number;
}

/**
 * Complete set of icons the UI knows how to render.
 * Config may reference any key here; keys not present are ignored
 * and the node falls back to its default icon.
 */
export const WORKFLOW_ICON_REGISTRY: Record<
	string,
	ComponentType<TablerIconProps>
> = {
	user_circle: IconUserCircle,
	plug_connected: IconPlugConnected,
	tool: IconTool,
	phone_call: IconPhoneCall,
	user_cog: IconUserCog,
	headset: IconHeadset,
	message: IconMessage,
	brain: IconBrain,
	shield: IconShield,
	credit_card: IconCreditCard,
	calendar: IconCalendar,
	clipboard_check: IconClipboardCheck,
	mail: IconMail,
	bell: IconBell,
	search: IconSearch,
	database: IconDatabase,
	lock: IconLock,
	settings: IconSettings,
	chart_bar: IconChartBar,
	world: IconWorld,
	heart: IconHeart,
	star: IconStar,
	bolt: IconBolt,
	rocket: IconRocket,
	flag: IconFlag,
	book: IconBook,
	briefcase: IconBriefcase,
	target: IconTarget,
	clock: IconClock,
	map_pin: IconMapPin,
};

/** Default icon when no custom icon is set or the key is invalid */
export const DEFAULT_NODE_ICON_KEY = 'user_circle';

/**
 * Resolve a config icon key to a React component.
 * Returns `undefined` when the key is not recognised.
 */
export const resolveWorkflowIcon = (
	iconKey?: string
): ComponentType<TablerIconProps> | undefined => {
	if (!iconKey) return undefined;
	return WORKFLOW_ICON_REGISTRY[iconKey];
};

// ---------------------------------------------------------------------------
// Forbidden colors — reserved for Start (green) and End (red) nodes
// ---------------------------------------------------------------------------

/** Colors reserved for Start node — users may NOT assign them to other nodes */
export const FORBIDDEN_START_COLORS = [
	'#b2f2bb', // green-2
	'#8ce99a', // green-3
	'#69db7c', // green-4
	'#51cf66', // green-5
	'#40c057', // green-6
	'#37b24d', // green-7
	'#2f9e44', // green-8
	'#2b8a3e', // green-9
];

/** Colors reserved for End node — users may NOT assign them to other nodes */
export const FORBIDDEN_END_COLORS = [
	'#ffc9c9', // red-2
	'#ffa8a8', // red-3
	'#ff8787', // red-4
	'#ff6b6b', // red-5
	'#fa5252', // red-6
	'#f03e3e', // red-7
	'#e03131', // red-8
	'#c92a2a', // red-9
];

/** All forbidden colors (union of start + end) */
export const FORBIDDEN_NODE_COLORS = [
	...FORBIDDEN_START_COLORS,
	...FORBIDDEN_END_COLORS,
];

/**
 * Curated palette of colors a user can pick for workflow nodes.
 * None of these overlap with the forbidden Start/End ranges.
 */
export const NODE_COLOR_PALETTE = [
	// Blues
	'#a5d8ff',
	'#74c0fc',
	'#4dabf7',
	'#339af0',
	'#228be6',
	'#1c7ed6',
	// Cyans
	'#99e9f2',
	'#66d9e8',
	'#3bc9db',
	'#22b8cf',
	'#15aabf',
	'#0c8599',
	// Teals
	'#96f2d7',
	'#63e6be',
	'#38d9a9',
	'#20c997',
	'#12b886',
	'#099268',
	// Limes
	'#d8f5a2',
	'#c0eb75',
	'#a9e34b',
	'#94d82d',
	'#82c91e',
	'#74b816',
	// Violets
	'#d0bfff',
	'#b197fc',
	'#9775fa',
	'#845ef7',
	'#7048e8',
	'#6741d9',
	// Grapes
	'#eebefa',
	'#e599f7',
	'#da77f2',
	'#cc5de8',
	'#be4bdb',
	'#ae3ec9',
	// Indigos
	'#bac8ff',
	'#91a7ff',
	'#748ffc',
	'#5c7cfa',
	'#4c6ef5',
	'#4263eb',
	// Pinks
	'#fcc2d7',
	'#faa2c1',
	'#f783ac',
	'#e64980',
	'#d6336c',
	'#c2255c',
	// Oranges
	'#ffd8a8',
	'#ffc078',
	'#ffa94d',
	'#ff922b',
	'#fd7e14',
	'#e8590c',
	// Yellows
	'#ffec99',
	'#ffe066',
	'#ffd43b',
	'#fcc419',
	'#fab005',
	'#f59f00',
	// Grays
	'#e9ecef',
	'#dee2e6',
	'#ced4da',
	'#adb5bd',
	'#868e96',
	'#495057',
];
