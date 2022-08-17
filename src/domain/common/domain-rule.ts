import {
	Rule, SchematicContext, Tree, apply, url, move, mergeWith, applyTemplates, MergeStrategy,
} from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { isDefined, Maybe } from '@opi-pib/ts-utility';

import { SchemaOptions } from './schema-options';
import { Options } from './options';
import getSetupOptions from './setup-options';

export default async function getDomainRule(
	tree: Tree,
	_context: SchematicContext,
	_options: SchemaOptions,
): Promise<void | Rule> {
	const options: Maybe<Options> = await getSetupOptions(tree, _options);

	let movePath: string = '';

	if (isDefined(options)) {
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
