import { Rule, SchematicContext, Tree, apply, url, move, mergeWith, applyTemplates, MergeStrategy } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { Is, Maybe } from '@opi_pib/ts-utility';
import { Project } from 'ts-morph';

import { SchemaOptions } from './schema-options';
import { Options, Prop } from './options';
import getSetupOptions from './setup-options';
import { extractPropertyMetadata, getInterfaceFiles, getTypeConstructor, getTypeDef, isDeclaredNullable } from './utlis';
import { dasherize } from '../common/utils';

export default async function getRule(tree: Tree, _context: SchematicContext, _options: SchemaOptions): Promise<void | Rule> {
	const project = new Project({
		useInMemoryFileSystem: true,
	});

	const options: Maybe<Options> = await getSetupOptions(tree, { ..._options });

	let movePath = '';
	const interfaces: Prop[] = [];

	if (Is.defined(options)) {
		movePath = options.flat ? normalize(options.path || '') : normalize(`${options.path}/${dasherize(options.name)}`);

		const allFiles = getInterfaceFiles(tree, options.dtos, options.projectRoot);

		allFiles.forEach((filePath) => {
			const buffer = tree.read(filePath);
			if (!buffer) {
				throw new Error(`Unable to read file from tree: ${filePath}`);
			}

			const fileContent = buffer.toString();
			project.createSourceFile(filePath, fileContent, { overwrite: true });
		});

		const file = project.getSourceFileOrThrow(`${dasherize(_options.dto)}.ts`);
		const fileInterface = file.getInterfaceOrThrow(_options.dto);

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
				typeConstructor: getTypeConstructor({
					name: prop.getName(),
					type,
					isArray,
					isNullable: isDeclaredNullable(prop),
					isOptional: prop.hasQuestionToken(),
				}),
			});
		});
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
