import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

const workspaceOptions: WorkspaceOptions = {
	name: 'workspace',
	newProjectRoot: 'projects',
	version: '6.0.0',
};

const appOptions: ApplicationOptions = {
	name: 'value-object',
};

const collectionPath: string = path.join(__dirname, '../../collection.json');

describe('value-object', () => {
	let appTree: UnitTestTree;
	let testRunner: SchematicTestRunner;

	beforeEach(async () => {
		testRunner = new SchematicTestRunner('schematics', collectionPath);
		appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
		appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree).toPromise();
	});

	it('works', async () => {
		const tree = await testRunner.runSchematicAsync('value-object', { name: 'uuid' }, appTree).toPromise();

		const expectedFiles = [
			'/projects/value-object/src/uuid/is-uuid-props.ts',
			'/projects/value-object/src/uuid/uuid-props.ts',
			'/projects/value-object/src/uuid/uuid.ts',
			'/projects/value-object/src/uuid/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});

	it('works with path', async () => {
		const tree = await testRunner.runSchematicAsync('value-object', { name: 'uuid', path: 'src/custom' }, appTree).toPromise();

		const expectedFiles = [
			'/projects/value-object/src/custom/uuid/is-uuid-props.ts',
			'/projects/value-object/src/custom/uuid/uuid-props.ts',
			'/projects/value-object/src/custom/uuid/uuid.ts',
			'/projects/value-object/src/custom/uuid/index.ts',
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});
});
