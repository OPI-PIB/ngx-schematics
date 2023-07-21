/* eslint-disable */
export default {
	displayName: 'ngx-schematics',
	preset: './jest.preset.js',
	transform: {
		'^.+\\.[tj]s$': [
			'ts-jest',
			{ tsconfig: '<rootDir>/tsconfig.spec.json' },
		],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: './coverage/ngx-schematics',
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
		'<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
	],
};
