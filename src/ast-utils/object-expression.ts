import { visit, parseValue, builders, namedTypes } from './common';
import { isLastIterItem, splitPath } from '../utils/common';

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

export function traverseObjectNestedPath(ast, path): any {
  let { segments, lastIdx } = splitPath(path);
  let currentSegment = segments.next();

  let result = {
    error: true,
    nodePath: null,
    segment: currentSegment.value[1],
    isLastSegment: isLastIterItem(currentSegment, lastIdx)
  };

  visit(ast, "Property", function (nodePath) {
    // if key is not the same as node name stop traversing this subtree
    if (nodePath.node.key.name !== currentSegment.value[1]) {
      result.error = true;
      return false;
    }
    // if key is the same remove error and same nodePath
    result.error = false;
    result.nodePath = nodePath;
    // move to the next step
    currentSegment = segments.next();
    // check if remaining segment is the last one
    result.isLastSegment = isLastIterItem(currentSegment, lastIdx);
    // if iterator done the we done as well
    if (currentSegment.done) this.abort();
    // if we have one more step then mark it as error(in case we have empty object)
    // that won't be visited
    result.error = true;
    // save current segment to result in case we need to create a new property
    result.segment = currentSegment.value[1];
    // try to traverse current branch(this won't work is object is empty)
    this.traverse(nodePath);
  });
  // if we didn't make it to the last node then traverse was unsuccessful
  if (!result.isLastSegment) result.error = true;
  return result;
}

export function getObjectValue(ast, path) {
  let { nodePath, error } = traverseObjectNestedPath(ast, path);
  return error ? null : nodePath.node.value;
}

export function setObjectValue(ast, path, value) {
  let { nodePath, error, segment, isLastSegment } = traverseObjectNestedPath(ast, path);
  let object = nodePath ? nodePath.node.value : ast;
  if (error && isLastSegment && namedTypes.ObjectExpression.check(object)) {
    let prop = buildObjectProperty(segment, value);
    object.properties.push(prop);
    error = false;
  } else if (!error) {
    nodePath.node.value = parseValue(value);
  }
  return !error;
}

export function removeObjectKey(ast, path) {
  let { nodePath, error } = traverseObjectNestedPath(ast, path)
  if (!error) nodePath.prune();
  return !error;
}

export function buildObjectProperty(key, value) {
  return builders.property(
    'init',
    builders.identifier(key),
    parseValue(value)
  );
}
