import { normalize, strings } from '@angular-devkit/core';
import {
	apply,
	applyTemplates,
	MergeStrategy,
	mergeWith,
	move,
	Rule,
	SchematicContext,
	Tree,
	url
} from '@angular-devkit/schematics';
import { Is, Maybe } from '@opi_pib/ts-utility';

import { Options } from './options';
import { SchemaOptions } from './schema-options';
import getSetupOptions from './setup-options';

export default async function getDomainRule(
	tree: Tree,
	_context: SchematicContext,
	_options: SchemaOptions
): Promise<void | Rule> {
	const options: Maybe<Options> = await getSetupOptions(tree, _options);

	let movePath = '';

	if (Is.defined(options)) {
		movePath = options.flat
			? normalize(options.path || '')
			: normalize(`${options.path}/${strings.dasherize(options.name)}`);
	}

	const templateSource = apply(url('./files'), [
		applyTemplates({
			...strings,
			...options
		}),
		move(movePath)
	]);

	const rule = mergeWith(templateSource, MergeStrategy.Default);

	return rule;
}
