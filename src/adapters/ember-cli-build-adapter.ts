import { BaseAdapter } from './base-adapter';
import { getKey, setKey, removeKey } from '../ast-utils/object-expression';
import { print, visit, namedTypes, builders } from '../ast-utils/common';

const EMBER_BUILDERS = ['EmberApp', 'EmberAddon', 'EngineAddon'];

function isEqualImportPath(arg, importPath) {
  return (
    (namedTypes.Literal.check(arg) && arg.value === importPath) ||
    (namedTypes.ObjectExpression.check(arg) &&
      arg.properties.find((prop) => prop.value.value === importPath))
  );
}

export class EmberCliBuildAdapter extends BaseAdapter {
  private objAst;
  private treeReturn;

  constructor(opts) {
    super(opts);
    this.findObj();
    if (!this.objAst) { throw new Error('Cannot locate build object.'); }
    this.findTreeReturn();
  }

  public get(key) {
    let value = getKey(this.objAst, key);
    return print(value);
  }

  public set(key, value) {
    return setKey(this.objAst, key, value);
  }

  public remove(key) {
    return removeKey(this.objAst, key);
  }

  public addImport(path) {
    let importStatement = this.findImport(path);

    if (!importStatement) {
      if (!this.treeReturn) { throw new Error('Cannot locate app tree return.'); }
      importStatement = builders.expressionStatement(
        builders.callExpression(
          builders.memberExpression(
            builders.identifier('app'),
            builders.identifier('import')
          ),
          [builders.literal(path)]
        )
      );
      this.treeReturn.insertBefore(importStatement);
    }

    return true;
  }

  public removeImport(path) {
    let importStatement = this.findImport(path);
    if (!importStatement) { return false; }
    importStatement.prune();
    return true;
  }

  private findObj() {
    let ctx = this;
    visit(this.ast, 'VariableDeclarator', function(nodePath) {
      if (
        nodePath.node.id.name === 'app' &&
        namedTypes.NewExpression.check(nodePath.node.init) &&
        EMBER_BUILDERS.indexOf(nodePath.node.init.callee.name) !== -1 &&
        namedTypes.ObjectExpression.check(nodePath.node.init.arguments[1])
      ) {
        ctx.objAst = nodePath.node.init.arguments[1];
        this.abort();
      }
      this.traverse(nodePath);
    });
  }

  private findTreeReturn() {
    let ctx = this;
    visit(this.ast, 'ReturnStatement', function(nodePath) {
      if (
        namedTypes.CallExpression.check(nodePath.node.argument) &&
        namedTypes.MemberExpression.check(nodePath.node.argument.callee) &&
        nodePath.node.argument.callee.object.name === 'app' &&
        nodePath.node.argument.callee.property.name === 'toTree'
      ) {
        ctx.treeReturn = nodePath;
        this.abort();
      }
      return false;
    });
  }

  private findImport(importPath) {
    let importStatement;
    visit(this.ast, 'CallExpression', function(nodePath) {
      if (
        namedTypes.MemberExpression.check(nodePath.node.callee) &&
        nodePath.node.callee.object.name === 'app' &&
        nodePath.node.callee.property.name === 'import' &&
        isEqualImportPath(nodePath.node.arguments[0], importPath)
      ) {
        importStatement = nodePath;
        this.abort();
      }
      return false;
    });
    return importStatement;
  }
}
