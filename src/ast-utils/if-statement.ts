import { visit } from './common';

export function findIfStatementByHandles(ast/*, left, right*/) {
  visit(ast, 'IfStatement', function (nodePath) {
    console.log('if', nodePath);
    this.traverse(nodePath);
  });
}
