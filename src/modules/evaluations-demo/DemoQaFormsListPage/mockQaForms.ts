export type DemoQaFormStatus = 'Ready' | 'Draft';

export interface DemoQaForm {
	id: string;
	testName: string;
	qaType: string;
	createdDate: string;
	status: DemoQaFormStatus;
	createdBy: string;
}

export const DEMO_QA_FORMS: DemoQaForm[] = [
	{
		id: 'form-1',
		testName: 'Sales Call Quality Standards',
		qaType: 'Sales',
		createdDate: '2026-06-15',
		status: 'Ready',
		createdBy: 'John Smith',
	},
	{
		id: 'form-2',
		testName: 'Product Description Accuracy',
		qaType: 'Localization',
		createdDate: '2026-06-10',
		status: 'Draft',
		createdBy: 'Maria Garcia',
	},
	{
		id: 'form-3',
		testName: 'Customer Retention Messaging',
		qaType: 'Retention',
		createdDate: '2026-06-08',
		status: 'Ready',
		createdBy: 'Sarah Johnson',
	},
	{
		id: 'form-4',
		testName: 'New User Activation Flow',
		qaType: 'Activation',
		createdDate: '2026-06-05',
		status: 'Ready',
		createdBy: 'Michael Chen',
	},
	{
		id: 'form-5',
		testName: 'Invoice Accuracy & Compliance',
		qaType: 'Accounts Receivable',
		createdDate: '2026-05-28',
		status: 'Draft',
		createdBy: 'Amanda Wilson',
	},
	{
		id: 'form-6',
		testName: 'Multi-language Support Testing',
		qaType: 'Localization',
		createdDate: '2026-05-20',
		status: 'Ready',
		createdBy: 'James Rodriguez',
	},
	{
		id: 'form-7',
		testName: 'Regulatory & Legal Compliance Audit',
		qaType: 'Compliance',
		createdDate: '2026-07-15',
		status: 'Ready',
		createdBy: 'Lisa Anderson',
	},
];
