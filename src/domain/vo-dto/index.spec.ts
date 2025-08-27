import * as path from 'path';
import * as fs from 'fs';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

import { dasherizeWithNumbers } from '../common/utils';

const apiDir = path.resolve(__dirname, '../../api');

const loadApiFiles = (tree: UnitTestTree, projectPath = '/projects/vo-dto/src/api') => {
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

		const contentIsProps = tree.readContent('/projects/vo-dto/src/user-impl/is-user-impl-props.ts');
		expect(normalize(contentIsProps)).toContain(
			normalize(
				`import { UserImplProps, UserImplPropsSchema } from './user-impl-props';
				export const isUserImplProps = (
					obj: unknown
				): obj is UserImplProps => UserImplPropsSchema.safeParse(obj).success;
				`
			)
		);

		const contentProps = tree.readContent('/projects/vo-dto/src/user-impl/user-impl-props.ts');
		expect(normalize(contentProps)).toContain(
			normalize(
				`import { z } from 'zod';
				export const UserImplPropsSchema = z.object({
					firstname: z.string(),
					midname: z.string().nullable(),
					lastname: z.string().nullish(),
					age: z.number().nullable(),
					active: z.boolean(),
					activeNullable: z.boolean().nullable(),
					activeOptional: z.boolean().nullish(),
					address: z.instanceof(AdressImpl),
					addressNullable: z.instanceof(AdressImpl).nullable(),
					addressOptional: z.instanceof(AdressImpl).nullish(),
					keywords: z.string().array(),
					friends: z.instanceof(UserImpl).array(),
					friendsOptional: z.instanceof(UserImpl).array().nullish(),
					friendsNullable: z.instanceof(UserImpl).array().nullable(),
				});
				export type UserImplProps = z.infer<typeof UserImplPropsSchema>;`
			)
		);

		const content = tree.readContent('/projects/vo-dto/src/user-impl/user-impl.ts');
		expect(normalize(content)).toContain(
			normalize(
				`import { always, Is, ValueObject } from '@opi_pib/ts-utility';
				import { UserImplProps } from './user-impl-props';
				import { isUserImplProps } from './is-user-impl-props';
				export class UserImpl extends ValueObject<UserImplProps> {
					constructor(protected override readonly props: UserImplProps) { super(props); }
					static create(props: UserImplProps): UserImpl { always(isUserImplProps(props), ''); return new UserImpl(props); }
					static fromDto(dto: UserDto) {
						return this.create({
							firstname: dto.firstname,
							midname: Is.defined(dto.midname) ? dto.midname : null,
							lastname: Is.defined(dto.lastname) ? dto.lastname : null,
							age: Is.defined(dto.age) ? dto.age : null,
							active: dto.active,
							activeNullable: Is.defined(dto.activeNullable) ? dto.activeNullable : null,
							activeOptional: Is.defined(dto.activeOptional) ? dto.activeOptional : null,
							address: AdressImpl.fromDto(dto.address),
							addressNullable: Is.defined(dto.addressNullable) ? AdressImpl.fromDto(dto.addressNullable) : null,
							addressOptional: Is.defined(dto.addressOptional) ? AdressImpl.fromDto(dto.addressOptional) : null,
							keywords: dto.keywords, friends: dto.friends.map((x) => UserImpl.fromDto(x)),
							friendsOptional: Is.defined(dto.friendsOptional) ? dto.friendsOptional.map((x) => UserImpl.fromDto(x)) : null,
							friendsNullable: Is.defined(dto.friendsNullable) ? dto.friendsNullable.map((x) => UserImpl.fromDto(x)) : null,
						});
					}
					get firstname() { return this.props.firstname; }
					get midname() { return this.props.midname; }
					get lastname() { return this.props.lastname; }
					get age() { return this.props.age; }
					get active() { return this.props.active; }
					get activeNullable() { return this.props.activeNullable; }
					get activeOptional() { return this.props.activeOptional; }
					get address() { return this.props.address; }
					get addressNullable() { return this.props.addressNullable; }
					get addressOptional() { return this.props.addressOptional; }
					get keywords() { return this.props.keywords; }
					get friends() { return this.props.friends; }
					get friendsOptional() { return this.props.friendsOptional; }
					get friendsNullable() { return this.props.friendsNullable; }
				}
				`
			)
		);
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

	it('dasherize', () => {
		expect(dasherizeWithNumbers('TypeK2')).toBe('type-k-2');
	});
});
