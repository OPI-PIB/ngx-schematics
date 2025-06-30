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
	name: 'voDto',
};

const collectionPath: string = path.join(__dirname, '../../collection.json');

describe('voDto', () => {
	let appTree: UnitTestTree;
	let testRunner: SchematicTestRunner;

	beforeEach(async () => {
		testRunner = new SchematicTestRunner('schematics', collectionPath);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);
	});

	it('works', async () => {
		const tree = await testRunner.runSchematic('voDto', { dto: 'UserDto' }, appTree);

		const expectedFiles = [
			'/projects/vo-dto/src/user-impl/is-user-impl-props.ts',
			'/projects/vo-dto/src/user-impl/user-impl-props.ts',
			'/projects/vo-dto/src/user-impl/user-impl.ts',
			'/projects/vo-dto/src/user-impl/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});

	it('works with path', async () => {
		const tree = await testRunner.runSchematic('voDto', { dto: 'UserDto', path: 'src/custom' }, appTree);

		const expectedFiles = [
			'/projects/vo-dto/src/custom/user-impl/is-user-impl-props.ts',
			'/projects/vo-dto/src/custom/user-impl/user-impl-props.ts',
			'/projects/vo-dto/src/custom/user-impl/user-impl.ts',
			'/projects/vo-dto/src/custom/user-impl/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});
});
