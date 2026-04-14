import type { DispositionCatalogModel } from './DispositionCatalogModels';

export interface DispositionFlowModel {
	id: number;
	clientId: number;
	userId: number;
	campaignId: number;
	flowJson: DispositionCatalogModel;
}
