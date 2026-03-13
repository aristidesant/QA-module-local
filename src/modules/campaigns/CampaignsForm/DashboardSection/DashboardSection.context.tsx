import {
	createContext,
	useContext,
	useMemo,
	useState,
	type PropsWithChildren,
	type Dispatch,
	type SetStateAction,
} from 'react';
import type {
	DashboardDefinition,
	DashboardWidget,
} from '~/models/AnalyticsDashboard';

type DashboardSectionSelectionContextValue = {
	campaignId: number;
	selectedDashboardId: number | null;
	setSelectedDashboardId: Dispatch<SetStateAction<number | null>>;
	isPreviewOpen: boolean;
	setIsPreviewOpen: Dispatch<SetStateAction<boolean>>;
};

type DashboardSectionModalContextValue = {
	dashboardModalOpened: boolean;
	widgetModalOpened: boolean;
	editingDashboard: DashboardDefinition | null;
	editingWidget: DashboardWidget | null;
	openCreateDashboard: () => void;
	openEditDashboard: (dashboard: DashboardDefinition) => void;
	closeDashboardModal: () => void;
	openCreateWidget: () => void;
	openEditWidget: (widget: DashboardWidget) => void;
	closeWidgetModal: () => void;
};

const DashboardSectionSelectionContext =
	createContext<DashboardSectionSelectionContextValue | null>(null);
const DashboardSectionModalContext =
	createContext<DashboardSectionModalContextValue | null>(null);

export const DashboardSectionProvider = ({
	campaignId,
	children,
}: PropsWithChildren<{ campaignId: number }>) => {
	const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(
		null
	);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [dashboardModalOpened, setDashboardModalOpened] = useState(false);
	const [widgetModalOpened, setWidgetModalOpened] = useState(false);
	const [editingDashboard, setEditingDashboard] =
		useState<DashboardDefinition | null>(null);
	const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(
		null
	);

	const selectionValue = useMemo(
		() => ({
			campaignId,
			selectedDashboardId,
			setSelectedDashboardId,
			isPreviewOpen,
			setIsPreviewOpen,
		}),
		[campaignId, isPreviewOpen, selectedDashboardId]
	);

	const modalValue = useMemo(
		() => ({
			dashboardModalOpened,
			widgetModalOpened,
			editingDashboard,
			editingWidget,
			openCreateDashboard: () => {
				setEditingDashboard(null);
				setDashboardModalOpened(true);
			},
			openEditDashboard: (dashboard: DashboardDefinition) => {
				setEditingDashboard(dashboard);
				setDashboardModalOpened(true);
			},
			closeDashboardModal: () => {
				setDashboardModalOpened(false);
				setEditingDashboard(null);
			},
			openCreateWidget: () => {
				setEditingWidget(null);
				setWidgetModalOpened(true);
			},
			openEditWidget: (widget: DashboardWidget) => {
				setEditingWidget(widget);
				setWidgetModalOpened(true);
			},
			closeWidgetModal: () => {
				setWidgetModalOpened(false);
				setEditingWidget(null);
			},
		}),
		[dashboardModalOpened, editingDashboard, editingWidget, widgetModalOpened]
	);

	return (
		<DashboardSectionSelectionContext.Provider value={selectionValue}>
			<DashboardSectionModalContext.Provider value={modalValue}>
				{children}
			</DashboardSectionModalContext.Provider>
		</DashboardSectionSelectionContext.Provider>
	);
};

export const useDashboardSectionSelection = () => {
	const context = useContext(DashboardSectionSelectionContext);

	if (!context) {
		throw new Error(
			'useDashboardSectionSelection must be used within DashboardSectionProvider'
		);
	}

	return context;
};

export const useDashboardSectionModals = () => {
	const context = useContext(DashboardSectionModalContext);

	if (!context) {
		throw new Error(
			'useDashboardSectionModals must be used within DashboardSectionProvider'
		);
	}

	return context;
};
