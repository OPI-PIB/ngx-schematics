import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';

const workspaceOptions: WorkspaceOptions = {
	name: 'workspace',
	newProjectRoot: 'projects',
	version: '19.0.0',
};

const appOptions: ApplicationOptions = {
	name: 'entity',
};

const collectionPath: string = path.join(__dirname, '../../collection.json');

describe('entity', () => {
	let appTree: UnitTestTree;
	let testRunner: SchematicTestRunner;

	beforeEach(async () => {
		testRunner = new SchematicTestRunner('schematics', collectionPath);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);
	});

	it('works', async () => {
		const tree = await testRunner.runSchematic('entity', { name: 'user' }, appTree);

		const expectedFiles = [
			'/projects/entity/src/user/is-user-props.ts',
			'/projects/entity/src/user/user-props.ts',
			'/projects/entity/src/user/user.ts',
			'/projects/entity/src/user/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});

	it('works with path', async () => {
		const tree = await testRunner.runSchematic('entity', { name: 'user', path: 'src/custom' }, appTree);

		const expectedFiles = [
			'/projects/entity/src/custom/user/is-user-props.ts',
			'/projects/entity/src/custom/user/user-props.ts',
			'/projects/entity/src/custom/user/user.ts',
			'/projects/entity/src/custom/user/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});
});
