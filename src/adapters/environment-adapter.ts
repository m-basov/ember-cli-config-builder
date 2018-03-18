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

    this.envObjAst = findObjectByIdentifier(this.ast, 'ENV');
    if (!this.envObjAst) { throw new Error(`Cannot locate "ENV" object.`); }
  }

  public get(key) {
    let value = getKey(this.envObjAst, key);
    return print(value);
  }

  public set(key, value) {
    return setKey(this.envObjAst, key, value);
  }

  public remove(key) {
    return removeKey(this.envObjAst, key);
  }

  public env(name) {
    return new EnvBlock({
      parent: this,
      name
    });
  }
}
