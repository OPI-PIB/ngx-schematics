import { Path } from '@angular-devkit/core';

export interface Prop {
	name: string;
	typeDef: string;
	typeConstructor: string;
}

export interface Options {
	dto: string;
	name: string;
	path: Path;
	flat: boolean;
	dtos: string;
	projectRoot: string;
}
