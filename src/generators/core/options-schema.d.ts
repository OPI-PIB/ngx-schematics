export interface OptionsSchema {
	name: string;
	project?: string;
	path?: string;
	flat?: boolean;
}

export interface NormalizedOptionsSchema extends OptionsSchema {
	directory: string;
	path: string;
	className: string;
	fileName: string;
}
