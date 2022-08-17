import { noop, Rule } from '@angular-devkit/schematics';

/**
 * nx g @opi-pib/ngx-schematics:init
 */
export default function (): Rule {
	return () => noop();
}
