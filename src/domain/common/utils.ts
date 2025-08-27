import { strings } from '@angular-devkit/core';

export function dasherize(str: string) {
	// insert a dash between letters and numbers
	str = str.replace(/([a-zA-Z])([0-9])/g, '$1-$2');
	str = str.replace(/([0-9])([a-zA-Z])/g, '$1-$2');
	return strings.dasherize(str);
}
