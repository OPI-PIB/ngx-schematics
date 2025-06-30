import { resolve } from 'path';

import { Rule, SchematicContext, Tree, apply, url, move, mergeWith, applyTemplates, MergeStrategy } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { Is, Maybe } from '@opi_pib/ts-utility';
import { Project } from 'ts-morph';

import { SchemaOptions } from './schema-options';
import { Options, Prop } from './options';
import getSetupOptions from './setup-options';
import { extractPropertyMetadata, getInterfaceFiles, getTypeDef, isDeclaredNullable } from './utlis';

export default async function getRule(tree: Tree, _context: SchematicContext, _options: SchemaOptions): Promise<void | Rule> {
	const project = new Project();
	const allFiles = getInterfaceFiles(resolve(_options.dir));

	allFiles.forEach((file) => project.addSourceFileAtPath(file));

	const file = project.getSourceFileOrThrow(`${strings.dasherize(_options.dto)}.ts`);
	const fileInterface = file.getInterfaceOrThrow(_options.dto);

	const interfaces: Prop[] = [];
	const properties = fileInterface.getProperties();
	properties.forEach((prop) => {
		const pType = prop.getType();
		const { type, isArray } = extractPropertyMetadata(prop, pType);

		interfaces.push({
			name: prop.getName(),
			typeDef: getTypeDef({
				type,
				isArray,
				isNullable: isDeclaredNullable(prop),
				isOptional: prop.hasQuestionToken(),
			}),
		});
	});

	const options: Maybe<Options> = await getSetupOptions(tree, { ..._options });

	let movePath = '';

	if (Is.defined(options)) {
		movePath = options.flat ? normalize(options.path || '') : normalize(`${options.path}/${strings.dasherize(options.name)}`);
	}

	const templateSource = apply(url('./files'), [
		applyTemplates({
			...strings,
			...options,
			properties: interfaces,
		}),
		move(movePath),
	]);

	const rule = mergeWith(templateSource, MergeStrategy.Default);

	return rule;
}
