import {
	getProjects,
	joinPathFragments,
	names,
	normalizePath,
	readProjectConfiguration,
	type Tree,
} from '@nx/devkit';
import { always, Is, Maybe } from '@opi_pib/ts-utility';

import { NormalizedOptionsSchema, OptionsSchema } from './options-schema';

export function normalizeOptions(
	tree: Tree,
	options: OptionsSchema,
): NormalizedOptionsSchema {
	always(Is.string(options.name), 'Name is required');
	const generatorNames = names(options.name);
	const projects = getProjects(tree);
	const project = options.project
		? projects.get(options.project)
		: projects.values().next().value;
	const { root, sourceRoot } = readProjectConfiguration(tree, project.name);
	const normalizedPath: Maybe<string> = Is.string(options.path)
		? normalizePath(options.path)
		: null;

	const projectSourceRoot = Is.string(sourceRoot)
		? sourceRoot
		: joinPathFragments(root, 'src');

	const path = normalizedPath
		? joinPathFragments(projectSourceRoot, normalizedPath)
		: projectSourceRoot;

	const directory = joinPathFragments(
		options.flat === true ? projectSourceRoot : path,
		generatorNames.fileName,
	);

	return {
		...options,
		flat: options.flat ?? false,
		directory,
		path,
		className: generatorNames.className,
		fileName: generatorNames.fileName,
	};
}
