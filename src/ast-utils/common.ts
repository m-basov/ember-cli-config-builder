import recast from 'recast';

// aliases
export const builders = recast.types.builders;
export const namedTypes = recast.types.namedTypes;
export const parse = recast.parse;
// common
export const print = (ast) => recast.print(ast).code;
export const parseValue = (value) => recast.parse(`${value}`).program.body[0].expression;
export const maybeCall = (cb, ctx = null, ...args) => { if (cb) cb.apply(ctx, args); };
export const visit = (ast, node, fn) => recast.visit(ast, { [`visit${node}`]: fn });
