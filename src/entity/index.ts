import * as path from 'path';

import { type Tree } from '@nx/devkit';
import { OptionsSchema } from '../core/options-schema';
import { normalizeOptions } from '../core/normalize-options';
import { formatFiles, generateFiles } from '@nx/devkit';

export async function entity(tree: Tree, rawOptions: OptionsSchema) {
	const options = normalizeOptions(tree, rawOptions);

	generateFiles(tree, path.join(__dirname, 'files'), options.directory, {
		fileName: options.fileName,
		className: options.className,
		tpl: '',
	});

	await formatFiles(tree);
}
