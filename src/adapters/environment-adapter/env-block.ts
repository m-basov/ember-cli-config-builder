import { visit, namedTypes, builders, print } from '../../ast-utils/common';
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
    let path = key.split('.').reverse().entries();
    let currentSegment = path.next();
    let node;

    visit(this.ifBlockAst, 'MemberExpression', function (nodePath) {
      let segment = currentSegment.value[1];
      console.log('visit', segment, nodePath.node.property.name);
      if (nodePath.node.property.name !== segment) {
        node = null;
        return false;
      }
      if (!node) node = nodePath;
      currentSegment = path.next();
      if (currentSegment.done) this.abort();
      this.traverse(nodePath);
    });

    return print(node.parent.node.right);
  }

  set(_key, _value) {
    return false;
  }

  remove(_key) {
    return false;
  }

  save() {
    return this.parent.save(...arguments);
  }
}
