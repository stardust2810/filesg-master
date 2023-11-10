/* eslint-disable */
const frontendPresets = require('../../jest.frontend.preset');

export default {
  displayName: 'web-portal',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
          },
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web-portal',
  setupFilesAfterEnv: ['./src/mocks/msw/setupTest.ts', './jest-setup.ts'],
  ...frontendPresets,
};
