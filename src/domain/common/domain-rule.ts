import { Rule, SchematicContext, Tree, apply, url, move, mergeWith, applyTemplates, MergeStrategy } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { Is, Maybe } from '@opi_pib/ts-utility';

import { SchemaOptions } from './schema-options';
import { Options } from './options';
import getSetupOptions from './setup-options';
import { dasherize } from './utils';

export default async function getDomainRule(tree: Tree, _context: SchematicContext, _options: SchemaOptions): Promise<void | Rule> {
	const options: Maybe<Options> = await getSetupOptions(tree, _options);

	let movePath = '';

	if (Is.defined(options)) {
		movePath = options.flat ? normalize(options.path || '') : normalize(`${options.path}/${dasherize(options.name)}`);
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
