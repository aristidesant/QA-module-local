export default interface FileTypeModel {
	id: number;
	code: string;
	name: string;
	description?: string | null;
	extension?: string | null;
	mime?: string | null;
}
