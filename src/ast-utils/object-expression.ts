import { visit, parseValue, builders, namedTypes, maybeCall } from './common';

export function findObjectByIdentifier(ast, key) {
  let obj;
  visit(ast, "VariableDeclarator", function (nodePath) {
    if (nodePath.node.id.name === key) {
      obj = nodePath.node.init;
      this.abort();
    }
    this.traverse(nodePath);
  });
  return obj;
}

export function traverseObjectNestedPath(ast, path, cbs: { success?: (any, string) => any, error?: (any, string) => any, each?: (any, string) => any, afterAll?: () => any }) {
  let segments = path.split('.').entries();
  let currentSegment = segments.next();
  visit(ast, "Property", function (nodePath) {
    let [, key] = currentSegment.value;
    maybeCall(cbs.each, this, nodePath, key);
    if (nodePath.node.key.name !== key) {
      maybeCall(cbs.error, this, nodePath, key)
      return false;
    }
    maybeCall(cbs.success, this, nodePath, key);
    currentSegment = segments.next();
    if (currentSegment.done) this.abort();
    this.traverse(nodePath);
  });
  maybeCall(cbs.afterAll);
}

export function getObjectValue(ast, path) {
  let value;
  traverseObjectNestedPath(ast, path, {
    success(nodePath) { value = nodePath.node.value; },
    error() { value = undefined; }
  });
  return value;
}

export function setObjectValue(ast, path, value) {
  let error = false;
  let nodePathToUpdate;
  let skip = false;
  traverseObjectNestedPath(ast, path, {
    success(nodePath) {
      nodePathToUpdate = nodePath;
      error = false;
    },
    error(nodePath, pathSegment) {
      if (path.endsWith(pathSegment)
          && namedTypes.ObjectExpression.check(nodePath.parentPath.node)) {
        let prop = buildObjectProperty(pathSegment, value);
        console.log('new prop', prop, nodePath);
        nodePath.parentPath.node.properties.push(prop);
        error = false;
        skip = true;
        this.abort();
      } else {
        error = true
      }
    },
    afterAll() {
      if (!error && !skip) nodePathToUpdate.node.value = parseValue(value);
    }
  });
  return !error;
}

export function removeObjectKey(ast, path) {
  let error = false;
  let nodePathToRemove;
  traverseObjectNestedPath(ast, path, {
    success(nodePath) { nodePathToRemove = nodePath; error = false; },
    error() { error = true; },
    afterAll() { if (!error) nodePathToRemove.prune(); }
  });
  return !error;
}

export function buildObjectProperty(key, value) {
  return builders.property(
    'init',
    builders.identifier(key),
    parseValue(value)
  );
}
