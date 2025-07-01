import { normalize } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { PropertySignature, SyntaxKind, Type } from 'ts-morph';

export function trimDefinition(value: string) {
	return value
		.replace(/\[\]/g, '')
		.replace(/Array</g, '')
		.replace(/>/g, '')
		.replace(/null/g, '')
		.replace(/undefined/g, '')
		.replace(/\|/g, '')
		.trim();
}

export function transformName(name: string): string {
	const withoutDto = name.endsWith('Dto') ? name.slice(0, -3) : name;
	return `${withoutDto}Impl`;
}

export function extractPropertyMetadata(
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

export function getTypeDef(props: { type: string; isArray: boolean; isNullable: boolean; isOptional: boolean }): string {
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

function isPrimitive(type: unknown) {
	return type === 'string' || type === 'number' || type === 'boolean';
}

export function getTypeConstructor(props: {
	name: string;
	type: string;
	isArray: boolean;
	isNullable: boolean;
	isOptional: boolean;
}): string {
	const dto = `dto.${props.name}`;

	let typeConstructor = '';

	if (props.isNullable || props.isOptional) {
		if (props.isArray) {
			const arrayConstructor = isPrimitive(props.type) ? dto : `${dto}.map((x) => ${transformName(props.type)}.fromDto(x))`;
			typeConstructor = `Is.defined(${dto}) ? ${arrayConstructor} : null`;
		} else {
			if (isPrimitive(props.type)) {
				typeConstructor = `Is.defined(${dto}) ? ${dto} : null`;
			} else {
				typeConstructor = `Is.defined(${dto}) ? ${transformName(props.type)}.fromDto(${dto}) : null`;
			}
		}
	} else {
		if (props.isArray) {
			typeConstructor = isPrimitive(props.type) ? dto : `${dto}.map((x) => ${transformName(props.type)}.fromDto(x))`;
		} else {
			if (isPrimitive(props.type)) {
				typeConstructor = dto;
			} else {
				typeConstructor = `${transformName(props.type)}.fromDto(${dto})`;
			}
		}
	}

	return typeConstructor;
}

export function isDeclaredNullable(prop: PropertySignature): boolean {
	const typeNode = prop.getTypeNode();
	if (!typeNode) return false;

	return typeNode.getText().includes('null');
}

export const getInterfaceFiles = (tree: Tree, dtos: string, project?: string): string[] => {
	const files: string[] = [];

	const safeProjectsSegment = project ? `/${project.replace(/^\/|\/$/g, '')}/` : null;
	const safeDtosSegment = `/${dtos.replace(/^\/|\/$/g, '')}/`;

	const prefix = project ? normalize(`${safeProjectsSegment}${safeDtosSegment}`) : normalize(safeDtosSegment);

	tree.root.visit((filePath) => {
		if (!filePath.startsWith(prefix)) return;
		if (!filePath.endsWith('.ts')) return;

		files.push(filePath);
	});

	return files;
};
