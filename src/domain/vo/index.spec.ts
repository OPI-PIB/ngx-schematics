import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

const workspaceOptions: WorkspaceOptions = {
	name: 'workspace',
	newProjectRoot: 'projects',
	version: '20.0.0',
};

const appOptions: ApplicationOptions = {
	name: 'vo',
};

const collectionPath: string = path.join(__dirname, '../../collection.json');

describe('vo', () => {
	let appTree: UnitTestTree;
	let testRunner: SchematicTestRunner;

	beforeEach(async () => {
		testRunner = new SchematicTestRunner('schematics', collectionPath);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);
	});

	it('works', async () => {
		const tree = await testRunner.runSchematic('vo', { name: 'uuid' }, appTree);

		const expectedFiles = [
			'/projects/vo/src/uuid/is-uuid-props.ts',
			'/projects/vo/src/uuid/uuid-props.ts',
			'/projects/vo/src/uuid/uuid.ts',
			'/projects/vo/src/uuid/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});

	it('works with path', async () => {
		const tree = await testRunner.runSchematic('vo', { name: 'uuid', path: 'src/custom' }, appTree);

		const expectedFiles = [
			'/projects/vo/src/custom/uuid/is-uuid-props.ts',
			'/projects/vo/src/custom/uuid/uuid-props.ts',
			'/projects/vo/src/custom/uuid/uuid.ts',
			'/projects/vo/src/custom/uuid/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});
});
