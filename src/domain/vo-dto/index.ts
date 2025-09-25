import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import getRule from './rule';
import { SchemaOptions } from './schema-options';

export default function voDto(options: SchemaOptions): Rule {
	return (tree: Tree, context: SchematicContext) => getRule(tree, context, options);
}
