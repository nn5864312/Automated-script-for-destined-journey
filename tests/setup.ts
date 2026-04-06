import _ from 'lodash';

Object.assign(globalThis, {
  _,
  injectPrompts: jest.fn(),
  uninjectPrompts: jest.fn(),
  insertOrAssignVariables: jest.fn(),
});
