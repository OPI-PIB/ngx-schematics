import * as fs from 'fs';
import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

const apiDir = path.resolve(__dirname, '../../api');

const loadApiFiles = (tree: UnitTestTree, projectPath = '/projects/vo-enum/src/api') => {
	const files = fs.readdirSync(apiDir);

	for (const file of files) {
		const filePath = path.join(apiDir, file);
		const content = fs.readFileSync(filePath, 'utf-8');
		tree.create(`${projectPath}/${file}`, content);
	}
};

function normalize(value: string) {
	return value.trim().replace(/\s+/g, ' ');
}

const workspaceOptions: WorkspaceOptions = {
	name: 'workspace',
	newProjectRoot: 'projects',
	version: '20.0.0'
};

const appOptions: ApplicationOptions = {
	name: 'vo-enum'
};

const collectionPath: string = path.join(__dirname, '../../collection.json');

describe('vo-enum', () => {
	let appTree: UnitTestTree;
	let testRunner: SchematicTestRunner;

	beforeEach(async () => {
		testRunner = new SchematicTestRunner('schematics', collectionPath);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
		appTree = await testRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);

		loadApiFiles(appTree);
	});

	it('works', async () => {
		const tree = await testRunner.runSchematic('vo-enum', { dto: 'EnumDto' }, appTree);

		const expectedFiles = [
			'/projects/vo-enum/src/enum-impl/enum-impl-map.ts',
			'/projects/vo-enum/src/enum-impl/is-enum-impl-props.ts',
			'/projects/vo-enum/src/enum-impl/enum-impl-props.ts',
			'/projects/vo-enum/src/enum-impl/enum-impl.ts',
			'/projects/vo-enum/src/enum-impl/index.ts'
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);

		const contentMap = tree.readContent('/projects/vo-enum/src/enum-impl/enum-impl-map.ts');
		expect(normalize(contentMap)).toContain(
			normalize(
				`import { TranslationKey } from '@translations/translation-key';
				import { t } from '@translations/translation-marker';
				type EnumImplType = Record<EnumDto, { translationKey: TranslationKey; }>;
				export const mapEnumImpl: EnumImplType = { 'NOT_INCLUDED': { translationKey: t('EnumDto.NOT_INCLUDED'), }, 'FULLY_INCLUDED': { translationKey: t('EnumDto.FULLY_INCLUDED'), }, };`
			)
		);

		const contentIsProps = tree.readContent('/projects/vo-enum/src/enum-impl/is-enum-impl-props.ts');
		expect(normalize(contentIsProps)).toContain(
			normalize(
				`import { EnumImplProps, EnumImplPropsSchema } from './enum-impl-props';
				export const isEnumImplProps = ( obj: unknown ): obj is EnumImplProps => EnumImplPropsSchema.safeParse(obj).success;`
			)
		);

		const contentProps = tree.readContent('/projects/vo-enum/src/enum-impl/enum-impl-props.ts');
		expect(normalize(contentProps)).toContain(
			normalize(
				`import { z } from 'zod';
				export const EnumImplPropsSchema = z.object({ id: z.enum(EnumDto) }); export type EnumImplProps = z.infer<typeof EnumImplPropsSchema>;`
			)
		);

		const content = tree.readContent('/projects/vo-enum/src/enum-impl/enum-impl.ts');
		expect(normalize(content)).toContain(
			normalize(
				`import { always, ValueObject } from '@opi_pib/ts-utility';
				import { EnumImplProps } from './enum-impl-props';
				import { isEnumImplProps } from './is-enum-impl-props';
				import { mapEnumImpl } from './enum-impl-map';
				export class EnumImpl extends ValueObject<EnumImplProps> {
				constructor(protected override readonly props: EnumImplProps) { super(props); }
				static create(props: EnumImplProps): EnumImpl { always(isEnumImplProps(props), ''); return new EnumImpl(props); }
				static fromDto(dto: EnumDto) { return this.create({ id: dto }); }
				get translationKey() { return mapEnumImpl[this.props.id].translationKey; } }`
			)
		);
	});

	it('works with path', async () => {
		const tree = await testRunner.runSchematic('vo-enum', { dto: 'EnumDto', path: 'src/custom' }, appTree);

		const expectedFiles = [
			'/projects/vo-enum/src/custom/enum-impl/enum-impl-map.ts',
			'/projects/vo-enum/src/custom/enum-impl/is-enum-impl-props.ts',
			'/projects/vo-enum/src/custom/enum-impl/enum-impl-props.ts',
			'/projects/vo-enum/src/custom/enum-impl/enum-impl.ts',
			'/projects/vo-enum/src/custom/enum-impl/index.ts'
		];

		expect(expectedFiles.every((file) => tree.files.includes(file))).toBe(true);
	});
});
