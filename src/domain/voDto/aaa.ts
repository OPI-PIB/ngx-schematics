import { join, resolve } from 'path';

import { readdirSync } from 'fs-extra';
import { InterfaceDeclaration, Project, PropertySignature, SyntaxKind, Type } from 'ts-morph';

import { Prop } from './options';

function trimDefinition(value: string) {
	return value
		.replace('[]', '')
		.replace('Array<', '')
		.replace('>', '')
		.replace('null', '')
		.replace('undefined', '')
		.replace('|', '')
		.trim();
}

function transformName(name: string): string {
	const withoutDto = name.endsWith('Dto') ? name.slice(0, -3) : name;
	return `${withoutDto}Impl`;
}

function extractPropertyMetadata(
	prop: PropertySignature,
	type: Type
): {
	type: string;
	isArray: boolean;
} {
	let isArray = false;

	const unionTypes = type.isUnion() ? type.getUnionTypes() : [type];

	let baseType: Type | undefined;

	for (const t of unionTypes) {
		if (t.isArray()) {
			isArray = true;
			const elementType = t.getArrayElementTypeOrThrow();
			baseType = elementType;
		} else {
			baseType = t;
		}
	}

	if (!baseType) {
		baseType = type;
	}

	const typeNode = prop.getTypeNodeOrThrow();
	let name = 'unknown';

	if (typeNode.getKind() === SyntaxKind.UnionType) {
		const union = typeNode.asKindOrThrow(SyntaxKind.UnionType);
		const nonNullType = union.getTypeNodes().find((node) => node.getText() !== 'null' && node.getText() !== 'undefined');
		name = nonNullType?.getText() ?? 'unknown';
	}

	name = typeNode.getText();

	return {
		type: trimDefinition(name),
		isArray,
	};
}

function getTypeDef(props: { type: string; isArray: boolean; isNullable: boolean; isOptional: boolean }): string {
	let typeDef = '';

	if (props.type === 'string' || props.type === 'number' || props.type === 'boolean') {
		typeDef = `z.${props.type}()`;
	} else {
		typeDef = `z.instanceof(${transformName(props.type)})`;
	}
	if (props.isArray) {
		typeDef = `${typeDef}.array()`;
	}
	if (props.isNullable) {
		typeDef = `${typeDef}.nullable()`;
	} else if (props.isOptional) {
		typeDef = `${typeDef}.nullish()`;
	}

	return typeDef;
}

function isDeclaredNullable(prop: PropertySignature): boolean {
	const typeNode = prop.getTypeNode();
	if (!typeNode) return false;

	return typeNode.getText().includes('null');
}

function rule() {
	const dto = 'UserDto';
	const SRC_DIR = resolve('src/api');

	const getInterfaceFiles = (dir: string): string[] => {
		const files: string[] = [];
		const walk = (currentPath: string) => {
			const entries = readdirSync(currentPath, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(currentPath, entry.name);
				if (entry.isDirectory()) {
					walk(fullPath);
				} else if (entry.isFile() && fullPath.endsWith('.ts')) {
					files.push(fullPath);
				}
			}
		};
		walk(dir);
		return files;
	};

	const project = new Project();
	const allFiles = getInterfaceFiles(SRC_DIR);

	allFiles.forEach((file) => project.addSourceFileAtPath(file));

	const file = project.getSourceFileOrThrow(`${dto}.ts`);
	const fileInterface = file.getInterfaceOrThrow(dto);

	const interfaces: Prop[] = [];
	const properties = fileInterface.getProperties();
	properties.forEach((prop) => {
		const pType = prop.getType();
		const { type, isArray } = extractPropertyMetadata(prop, pType);

		interfaces.push({
			name: prop.getName(),
			typeDef: getTypeDef({
				type,
				isArray,
				isNullable: isDeclaredNullable(prop),
				isOptional: prop.hasQuestionToken(),
			}),
		});
	});
}

rule();
