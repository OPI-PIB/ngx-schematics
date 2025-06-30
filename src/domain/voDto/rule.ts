import { resolve, join } from 'path';

import { Rule, SchematicContext, Tree, apply, url, move, mergeWith, applyTemplates, MergeStrategy } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { Is, Maybe } from '@opi_pib/ts-utility';
import { readdirSync } from 'fs-extra';
import { Project } from 'ts-morph';

import { SchemaOptions } from './schema-options';
import { Options } from './options';
import getSetupOptions from './setup-options';

export default async function getRule(tree: Tree, _context: SchematicContext, _options: SchemaOptions): Promise<void | Rule> {
	const SRC_DIR = resolve('src/api');

	const getInterfaceFiles = (dir: string): string[] => {
		const files: string[] = [];
		const walk = (currentPath: string) => {
			const entries = readdirSync(currentPath, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(currentPath, entry.name);
				if (entry.isDirectory()) walk(fullPath);
				else if (entry.isFile() && fullPath.endsWith('.ts')) files.push(fullPath);
			}
		};
		walk(dir);
		return files;
	};

	const project = new Project();
	const allFiles = getInterfaceFiles(SRC_DIR);
	console.log(allFiles);
	/** */

	const options: Maybe<Options> = await getSetupOptions(tree, _options);

	let movePath = '';

	if (Is.defined(options)) {
		movePath = options.flat ? normalize(options.path || '') : normalize(`${options.path}/${strings.dasherize(options.name)}`);
	}

	const templateSource = apply(url('./files'), [
		applyTemplates({
			...strings,
			...options,
		}),
		move(movePath),
	]);

	const rule = mergeWith(templateSource, MergeStrategy.Default);

	return rule;
}
