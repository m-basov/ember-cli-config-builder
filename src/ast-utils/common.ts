import recast from 'recast';

// aliases
export const builders = recast.types.builders;
export const namedTypes = recast.types.namedTypes;
export const parse = recast.parse;
// ast helpers
export const print = (ast) => recast.print(ast, { quote: 'single' }).code;
export const parseValue = (value) =>
  recast.parse(`(${value})`).program.body[0].expression;
export const visit = (ast, node, fn) =>
  recast.visit(ast, { [`visit${node}`]: fn });
const IDENTIFIER_REGEX = /^([a-z]|\$|_)[\w\$_]*$/i;
export const keyType = (key) =>
  IDENTIFIER_REGEX.test(key) ? 'identifier' : 'literal';
