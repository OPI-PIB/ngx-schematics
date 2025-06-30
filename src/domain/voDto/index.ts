import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { SchemaOptions } from './schema-options';
import getRule from './rule';

export default function voDto(options: SchemaOptions): Rule {
	return (tree: Tree, context: SchematicContext) => getRule(tree, context, options);
}
