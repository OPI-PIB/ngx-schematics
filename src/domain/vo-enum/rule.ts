import { Rule, SchematicContext, Tree, apply, url, move, mergeWith, applyTemplates, MergeStrategy } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { Is, Maybe } from '@opi_pib/ts-utility';
import { Project, SyntaxKind } from 'ts-morph';

import { SchemaOptions } from './schema-options';
import { Options, Prop } from './options';
import getSetupOptions from './setup-options';
import { getInterfaceFiles } from './utlis';

export default async function getRule(tree: Tree, _context: SchematicContext, _options: SchemaOptions): Promise<void | Rule> {
	const project = new Project({
		useInMemoryFileSystem: true,
	});

	const options: Maybe<Options> = await getSetupOptions(tree, { ..._options });

	let movePath = '';
	const interfaces: Prop[] = [];

	if (Is.defined(options)) {
		movePath = options.flat ? normalize(options.path || '') : normalize(`${options.path}/${strings.dasherize(options.name)}`);

		const allFiles = getInterfaceFiles(tree, options.dtos, options.projectRoot);

		allFiles.forEach((filePath) => {
			const buffer = tree.read(filePath);
			if (!buffer) {
				throw new Error(`Unable to read file from tree: ${filePath}`);
			}

			const fileContent = buffer.toString();
			project.createSourceFile(filePath, fileContent, { overwrite: true });
		});

		const file = project.getSourceFileOrThrow(`${strings.dasherize(_options.dto)}.ts`);
		const fileInterface = file.getTypeAliasOrThrow(_options.dto);
		const typeNode = fileInterface.getTypeNodeOrThrow();

		if (typeNode.isKind(SyntaxKind.UnionType)) {
			const unionType = typeNode.asKindOrThrow(SyntaxKind.UnionType);
			const properties = unionType.getTypeNodes();
			properties.forEach((prop) => {
				interfaces.push({
					name: prop.getText().replace(/'/g, ''),
				});
			});
		}
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
