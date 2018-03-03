import { BaseAdapter } from './base-adapter';
import { EnvBlock } from './environment-adapter/env-block';
import { print } from '../ast-utils/common';
import {
  findObjectByIdentifier,
  getKey,
  setKey,
  removeKey
} from '../ast-utils/object-expression';


export class EnvironmentAdapter extends BaseAdapter {
  private envObjAst;

  constructor(opts) {
    super(opts);

    let envObjAst = findObjectByIdentifier(this.ast, 'ENV');
    if (!envObjAst) throw new Error(`Cannot locate "ENV" object.`);
    this.envObjAst = envObjAst;
  }

  get(key) {
    let value = getKey(this.envObjAst, key);
    return print(value);
  }

  set(key, value) {
    return setKey(this.envObjAst, key, value);
  }

  remove(key) {
    return removeKey(this.envObjAst, key);
  }

  env(name) {
    return new EnvBlock({
      path: this.path,
      charset: this.charset,
      ast: this.ast,
      name
    });
  }
}
