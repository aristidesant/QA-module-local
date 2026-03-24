import type React from 'react';

export interface HeaderField {
	key: string;
	value: string;
}

export interface QueryParameter {
	key: string;
	value: string;
}

export interface PathParameter {
	key: string;
	value: string;
}

export interface RequestBodyProperty {
	key: string;
	type: string;
	description: string;
	constantValue?: string;
	dynamicVariable?: string;
	required: boolean;
}

export interface FormValues {
	name: string;
	description: string;
	prompt: string;
	identifier: string;
	categoryId: string;
	status: string;
	url: string;
	method: string;
	responseTimeoutSecs: number;
	headers: HeaderField[];
	queryParameters: QueryParameter[];
	pathParameters: PathParameter[];
	requestBodyProperties: RequestBodyProperty[];
	authConnection: string;
}

export type SectionId =
	| 'basic'
	| 'api'
	| 'auth'
	| 'headers'
	| 'parameters'
	| 'body';

export interface Section {
	id: SectionId;
	label: string;
	description: string;
	icon: React.ReactNode;
}

export type SectionState =
	| 'complete'
	| 'current'
	| 'empty'
	| 'optional'
	| 'error'
	| 'inactive';

export interface SectionMeta {
	required: boolean;
	applicable: boolean;
	state: SectionState;
}

export type SectionMetaMap = Record<SectionId, SectionMeta>;
