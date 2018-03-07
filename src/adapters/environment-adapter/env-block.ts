import { visit, namedTypes, builders, print, parseValue } from '../../ast-utils/common';
import { BaseAdapter } from '../base-adapter';

function findEnvFunctionArgName(ast) {
  let envArgName;
  visit(ast, "AssignmentExpression", function (nodePath) {
    let { left, right } = nodePath.node;
    if (namedTypes.MemberExpression.check(left)
        && left.object.name === 'module'
        && left.property.name === 'exports'
        && namedTypes.FunctionExpression.check(right)) {
      envArgName = right.params[0].name;
      this.abort();
    }
    this.traverse(nodePath);
  })
  return envArgName;
}

function findEnvIfBlock(ast, envVarName, envName) {
  let envIfBlock;
  visit(ast, 'IfStatement', function (nodePath) {
    let { left, right } = nodePath.node.test;
    if ((namedTypes.Identifier.check(left)
          && left.name === envVarName
          && namedTypes.Literal.check(right)
          && right.value === envName)
       ||(namedTypes.Identifier.check(right)
          && right.name === envVarName
          && namedTypes.Literal.check(left)
          && left.value === envName)) {
      envIfBlock = nodePath.node;
      this.abort();
    }
    this.traverse(nodePath);
  });
  return envIfBlock;
}

function findEnvReturnStatement(ast) {
  let returnStatement;
  visit(ast, 'ReturnStatement', function (nodePath) {
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

function createEnvIfBlock(ast, envVarName, envName) {
  // we need to find return ENV stement to insert new environment overrides before it
  let returnStatement = findEnvReturnStatement(ast);
  if (!returnStatement) return;

  // build test line for IF
  let test = builders.binaryExpression(
    '===',
    builders.identifier(envVarName),
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

  return ifBlock;
}

function findNode(ast, key) {
  let value;
  let path = key.split('.');
  let isLastStep = (step) => (path.length - 1) <= step;
  let isNotEqual = (prop, segment) => (prop.name !== segment && prop.value !== segment);

  visit(ast, 'MemberExpression', function (nodePath) {
    let current = 0;
    if (nodePath.node.object.name !== 'ENV') return this.traverse(nodePath);
    if (isNotEqual(nodePath.node.property, path[current])) return false;
    let parent = nodePath.parentPath;
    while (namedTypes.MemberExpression.check(parent.node)) {
      if (isLastStep(current)) return false;
      current++;
      if (isNotEqual(parent.node.property, path[current])) return false;
      parent = parent.parentPath;
    }
    if (!namedTypes.AssignmentExpression.check(parent.node)) return false;
    value = parent;
    this.abort();
  });

  return value;
}

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
    this.envVarName = findEnvFunctionArgName(this.ast);
    // we cannot continue without env function arg name
    if (!this.envVarName) throw new Error('Cannot locate environment function.');
    // the we are trying to find if statement by env var name and env name
    // by default it looks like this:
    // if (environment === 'development') { … }
    this.ifBlockAst = findEnvIfBlock(this.ast, this.envVarName, name);
    // if there is no overrides for this environment we are creating a new one
    if (!this.ifBlockAst) {
      this.ifBlockAst = createEnvIfBlock(this.ast, this.envVarName, name);
    }
    // if we are not created it then throw error
    if (!this.ifBlockAst) throw new Error('Cannot find or create environment block.');
  }

  get(key) {
    let nodePath = findNode(this.ifBlockAst, key);
    return print(nodePath && nodePath.node.right);
  }

  set(key, value) {
    let nodePath = findNode(this.ifBlockAst, key);
    if (nodePath) {
      nodePath.node.right = parseValue(value);
      return true;
    }
    let path = key.split('.').reverse();
    let current = 0;
    let membership = builders.memberExpression(
      builders.identifier('ENV'),
      builders.identifier(path[current])
    );
    current++;
    while (current < path.length) {
      membership = builders.memberExpression(
        membership,
        builders.identifier(path[current])
      );
      current++;
    }
    let assignment = builders.assignmentExpression('=', membership, parseValue(value));
    this.ifBlockAst.consequent.body.push(assignment);
    return true;
  }

  remove(key) {
    let nodePath = findNode(this.ifBlockAst, key);
    if (!nodePath) return false;
    nodePath.prune();
    return true;
  }

  save() {
    return this.parent.save(...arguments);
  }
}
