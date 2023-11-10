/* eslint-disable */
const frontendPresets = require('../../../jest.frontend.preset');

export default {
  displayName: 'frontend-design-system',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/frontend/design-system',
  setupFilesAfterEnv: ['./jest-setup.ts'],
  ...frontendPresets,
};
