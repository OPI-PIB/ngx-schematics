import * as path from 'path';
import * as fs from 'fs';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

const apiDir = path.resolve(__dirname, '../../api');

const loadApiFiles = (tree: UnitTestTree, projectPath = '/projects/vo-dto/src/api') => {
	const files = fs.readdirSync(apiDir);

	for (const file of files) {
		const filePath = path.join(apiDir, file);
		const content = fs.readFileSync(filePath, 'utf-8');
		tree.create(`${projectPath}/${file}`, content);
	}
};

const workspaceOptions: WorkspaceOptions = {
	name: 'workspace',
	newProjectRoot: 'projects',
	version: '20.0.0',
};

const appOptions: ApplicationOptions = {
	name: 'vo-dto',
};

const collectionPath: string = path.join(__dirname, '../../collection.json');

describe('vo-dto', () => {
	let appTree: UnitTestTree;
	let testRunner: SchematicTestRunner;

	beforeEach(async () => {
		testRunner = new SchematicTestRunner('schematics', collectionPath);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);

		loadApiFiles(appTree);
	});

	it('works', async () => {
		const tree = await testRunner.runSchematic('vo-dto', { dto: 'UserDto' }, appTree);

		const expectedFiles = [
			'/projects/vo-dto/src/user-impl/is-user-impl-props.ts',
			'/projects/vo-dto/src/user-impl/user-impl-props.ts',
			'/projects/vo-dto/src/user-impl/user-impl.ts',
			'/projects/vo-dto/src/user-impl/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});

	it('works with path', async () => {
		const tree = await testRunner.runSchematic('vo-dto', { dto: 'UserDto', path: 'src/custom' }, appTree);

		const expectedFiles = [
			'/projects/vo-dto/src/custom/user-impl/is-user-impl-props.ts',
			'/projects/vo-dto/src/custom/user-impl/user-impl-props.ts',
			'/projects/vo-dto/src/custom/user-impl/user-impl.ts',
			'/projects/vo-dto/src/custom/user-impl/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});
});
