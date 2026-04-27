import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@xyflow/react';

interface SideActionsPortalProps {
	anchorRef: RefObject<HTMLElement | null>;
	visible: boolean;
	children: React.ReactNode;
	/** Horizontal gap (px) between the anchor's right edge and the portal. Default: 4 */
	offsetX?: number;
	/** Whether to align the portal to the vertical center or top of the anchor. Default: 'center' */
	verticalAlign?: 'center' | 'top';
	/** Extra vertical offset (px) applied after alignment. Default: 0 */
	offsetY?: number;
}

/**
 * Renders `children` in a `document.body` portal, positioned at the right
 * side of the given `anchorRef` element using `position: fixed` coordinates
 * derived from `getBoundingClientRect`.
 *
 * This escapes React Flow's node/edge stacking contexts entirely, which
 * prevents edge label layers from covering the side-action menus when nodes
 * are inside groups.
 *
 * Position is recomputed whenever the React Flow viewport transform changes
 * (pan / zoom) so the menu stays attached to the node during canvas navigation.
 *
 * z-index is intentionally set to 199 — below Mantine's popover layer (300)
 * so Tooltip and Menu popovers rendered via withinPortal appear above the panel.
 */
export const SideActionsPortal: React.FC<SideActionsPortalProps> = ({
	anchorRef,
	visible,
	children,
	offsetX = 4,
	verticalAlign = 'center',
	offsetY = 0,
}) => {
	const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

	// Subscribe to the React Flow viewport transform so position is recomputed
	// on every pan / zoom, keeping the menu attached to its anchor node.
	const transform = useStore((s) => s.transform);

	useEffect(() => {
		if (!visible) {
			setPos(null);
			return;
		}
		const el = anchorRef.current;
		if (!el) return;

		const rect = el.getBoundingClientRect();

		// Find the nearest React Flow wrapper to use as the clipping boundary.
		// Walking up the DOM from the anchor node, we look for the element with
		// the `.react-flow` class which is always the bounded canvas container.
		const flowEl = el.closest('.react-flow') as HTMLElement | null;
		const bounds = flowEl
			? flowEl.getBoundingClientRect()
			: { top: 0, bottom: window.innerHeight, right: window.innerWidth };

		const PANEL_HEIGHT_ESTIMATE = 320;
		const PANEL_WIDTH_ESTIMATE = 48; // width of a single-column button bar

		const rawTop =
			verticalAlign === 'center'
				? rect.top + rect.height / 2 + offsetY
				: rect.top + offsetY;

		// Clamp vertically within the canvas bounds, with 8px padding each side.
		const minTop = bounds.top + 8;
		const maxTop =
			verticalAlign === 'center'
				? bounds.bottom - PANEL_HEIGHT_ESTIMATE / 2 - 8
				: bounds.bottom - PANEL_HEIGHT_ESTIMATE - 8;
		const clampedTop = Math.min(Math.max(rawTop, minTop), maxTop);

		// Clamp horizontally: if placing to the right would overflow the canvas,
		// flip to the left side of the node.
		const preferredLeft = rect.right + offsetX;
		const left =
			preferredLeft + PANEL_WIDTH_ESTIMATE > bounds.right
				? rect.left - PANEL_WIDTH_ESTIMATE - offsetX
				: preferredLeft;

		setPos({ top: clampedTop, left });
	}, [visible, anchorRef, offsetX, verticalAlign, offsetY, transform]);

	if (!visible || !pos) return null;

	return createPortal(
		<div
			className='nodrag nopan'
			// inline-style-allow: portal position must be set inline — computed at runtime from getBoundingClientRect
			style={{
				position: 'fixed',
				top: pos.top,
				left: pos.left,
				transform: verticalAlign === 'center' ? 'translateY(-50%)' : undefined,
				zIndex: 199,
				pointerEvents: 'auto',
			}}
		>
			{children}
		</div>,
		document.body
	);
};

export default SideActionsPortal;
