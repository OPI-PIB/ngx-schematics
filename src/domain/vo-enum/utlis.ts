import { normalize } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';

export function transformName(name: string): string {
	const withoutDto = name.endsWith('Dto') ? name.slice(0, -3) : name;
	return `${withoutDto}Impl`;
}

export const getInterfaceFiles = (tree: Tree, dtos: string, project?: string): string[] => {
	const files: string[] = [];

	const safeProjectsSegment = project ? `/${project.replace(/^\/|\/$/g, '')}/` : '';
	const safeDtosSegment = `/${dtos.replace(/^\/|\/$/g, '')}/`;

	const prefix = normalize(`${safeProjectsSegment}${safeDtosSegment}`);

	const dir = tree.getDir(prefix);
	dir.visit((filePath) => {
		if (!filePath.endsWith('.ts')) return;

		files.push(filePath);
	});

	return files;
};
