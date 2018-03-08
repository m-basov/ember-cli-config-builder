import { visit, namedTypes, builders, print, parseValue, keyType } from '../../ast-utils/common';
import { BaseAdapter } from '../base-adapter';

export class EnvBlock extends BaseAdapter {
  private parent;
  private envVarName;
  private ifBlockAst;

  constructor({ parent, name }) {
    super({ ast: parent.ast, charset: parent.charset, path: parent.path });
    // we need parent to delegate save function to it
    this.parent = parent;
    // by default ember-cli exports config like this:
    // module.exports = function(environment) { … }
    // we need to get function arg name to be able to search
    // if blocks or create a new one
    this.findEnvVarName();
    // we cannot continue without env function arg name
    if (!this.envVarName) throw new Error('Cannot locate environment function.');
    // the we are trying to find if statement by env var name and env name
    // by default it looks like this:
    // if (environment === 'development') { … }
    this.findEnvIfBlock(name);
    // if there is no overrides for this environment we are creating a new one
    if (!this.ifBlockAst) this.createEnvIfBlock(name);
    // if we are not created it then throw error
    if (!this.ifBlockAst) throw new Error('Cannot find or create environment block.');
  }

  get(key) {
    let nodePath = this.findNode(key);
    return print(nodePath && nodePath.node.right);
  }

  set(key, value) {
    value = parseValue(value);

    let nodePath = this.findNode(key);
    if (nodePath) {
      nodePath.node.right = value;
    } else {
      let assignment = this.buildAssignment(key, value);
      this.ifBlockAst.consequent.body.push(assignment);
    }

    return true;
  }

  remove(key) {
    let nodePath = this.findNode(key);
    if (!nodePath) return false;
    nodePath.prune();
    return true;
  }

  save() {
    return this.parent.save(...arguments);
  }

  private findNode(key) {
    let value;
    let path = key.split('.');
    let isLastStep = (step) => (path.length - 1) <= step;
    // object keys may be either identifier or literal so we need to check both
    let isNotEqual = (prop, segment) => (prop.name !== segment && prop.value !== segment);

    visit(this.ifBlockAst, 'MemberExpression', function (nodePath) {
      let current = 0;
      // we need to find ENV expression first. Because member expressions
      // are reversed in AST if current object is not ENV the we need to traverse
      // tree deeper
      if (nodePath.node.object.name !== 'ENV') return this.traverse(nodePath);
      // after we found ENV object we need to check first path segment
      // if it is not equal then we found wong branch and need to search next
      if (isNotEqual(nodePath.node.property, path[current])) return false;
      // if first segment is equal we need to bubble to it's parent
      let parent = nodePath.parentPath;
      // and do so while parent is member expression(means <obj.prop> expression)
      while (namedTypes.MemberExpression.check(parent.node)) {
        // if we reached last segment of supplied path and didn't found assigment
        // then try another branch
        if (isLastStep(current)) return false;
        current++;
        // if current segment is not equal then try another branch again
        if (isNotEqual(parent.node.property, path[current])) return false;
        // if all is ok continue to bubble
        parent = parent.parentPath;
      }
      // after we bubbled to the last path segment we need to check if
      // current node is assignment expression and search another branch if not
      if (!namedTypes.AssignmentExpression.check(parent.node)) return false;
      // otherwise we found our node and should stop traversing
      value = parent;
      this.abort();
    });

    return value;
  }

  private findEnvVarName() {
    let ctx = this;
    visit(this.ast, "AssignmentExpression", function (nodePath) {
      let { left, right } = nodePath.node;
      if (namedTypes.MemberExpression.check(left)
          && left.object.name === 'module'
          && left.property.name === 'exports'
          && namedTypes.FunctionExpression.check(right)) {
        ctx.envVarName = right.params[0].name;
        this.abort();
      }
      this.traverse(nodePath);
    });
  }

  private findEnvIfBlock(envName) {
    let ctx = this;
    visit(this.ast, 'IfStatement', function (nodePath) {
      let { left, right } = nodePath.node.test;
      if ((namedTypes.Identifier.check(left)
            && left.name === ctx.envVarName
            && namedTypes.Literal.check(right)
            && right.value === envName)
         ||(namedTypes.Identifier.check(right)
            && right.name === ctx.envVarName
            && namedTypes.Literal.check(left)
            && left.value === envName)) {
        ctx.ifBlockAst = nodePath.node;
        this.abort();
      }
      this.traverse(nodePath);
    });
  }

  private createEnvIfBlock(envName) {
    // we need to find return ENV stement to insert new environment overrides before it
    let returnStatement = this.findEnvReturnStatement();
    if (!returnStatement) return;

    // build test line for IF
    let test = builders.binaryExpression(
      '===',
      builders.identifier(this.envVarName),
      builders.literal(envName)
    );
    // build NoOp block and add comment before it
    let noop = builders.noop();
    noop.comments = [
      builders.commentLine(` here you can enable a ${envName}-specific feature`, true, false)
    ];
    // build empty blody with comment inside
    let consequent = builders.blockStatement([noop]);
    // build if block
    let ifBlock = builders.ifStatement(test, consequent);
    // insert if right before return statement
    returnStatement.insertBefore(ifBlock);

    this.ifBlockAst = ifBlock;
  }

  private findEnvReturnStatement() {
    let returnStatement;
    visit(this.ast, 'ReturnStatement', function (nodePath) {
      let { argument } = nodePath.node;
      if (namedTypes.Identifier.check(argument)
          && argument.name === 'ENV') {
        returnStatement = nodePath;
        this.abort();
      }
      this.traverse(nodePath);
    });
    return returnStatement;
  }

  private buildAssignment(key, value) {
    let path = key.split('.');
    let segment = path[0];
    let membership = builders.memberExpression(
      builders.identifier('ENV'),
      builders[keyType(segment)](segment)
    );
    let current = 1;
    while (current < path.length) {
      segment = path[current];
      membership = builders.memberExpression(
        membership,
        builders[keyType(segment)](segment)
      );
      current++;
    }
    return builders.expressionStatement(
      builders.assignmentExpression('=', membership, value)
    );
  }
}
