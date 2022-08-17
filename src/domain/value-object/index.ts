import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import getDomainRule from '../common/domain-rule';
import { SchemaOptions } from '../common/schema-options';

export default function valueObject(options: SchemaOptions): Rule {
	return (tree: Tree, context: SchematicContext) => getDomainRule(tree, context, options);
}
