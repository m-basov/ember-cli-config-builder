import fs from 'fs';
import { print } from '../ast-utils/common';

export abstract class BaseAdapter {
  protected path;
  protected ast;
  protected charset;

  abstract get(key: string): string;
  abstract set(key: string, value: any): boolean;
  abstract remove(key: string): boolean;

  constructor({ path, charset, ast }) {
    this.path = path;
    this.charset = charset;
    this.ast = ast;
  }

  save(path, charset): string {
    path = path || this.path;
    charset = charset || this.charset;
    let content = print(this.ast);

    fs.writeFileSync(path, content, charset);

    return content;
  }

  getProperties(keys: string[]): Object {
    return keys.reduce((acc, key) => {
      acc[key] = this.get(key);
      return acc;
    }, {});
  }

  setProperties(props: Object): Object {
    return Object.keys(props).reduce((acc, key) => {
      acc[key] = this.set(key, props[key]);
      return acc;
    }, {});
  }

  removeProperties(keys: string[]): Object {
    return keys.reduce((acc, key) => {
      acc[key] = this.remove(key);
      return acc;
    }, {});
  }
}
