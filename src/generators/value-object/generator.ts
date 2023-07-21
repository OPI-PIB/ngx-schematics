import * as path from 'path';

import { formatFiles, generateFiles, Tree } from '@nx/devkit';

import { OptionsSchema } from '../core/options-schema';
import { normalizeOptions } from '../core/normalize-options';

export async function valueObjectGenerator(
	tree: Tree,
	rawOptions: OptionsSchema
) {
	const options = normalizeOptions(tree, rawOptions);

	generateFiles(tree, path.join(__dirname, 'files'), options.directory, {
		fileName: options.fileName,
		className: options.className,
		tpl: '',
	});

	await formatFiles(tree);
}

export default valueObjectGenerator;
