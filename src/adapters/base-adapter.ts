import fs from 'fs';
import { print } from '../ast-utils/common';

export abstract class BaseAdapter {
  protected path;
  protected ast;
  protected charset;

  constructor({ path, charset, ast }) {
    this.path = path;
    this.charset = charset;
    this.ast = ast;
  }

  public abstract get(key: string): string;
  public abstract set(key: string, value: any): boolean;
  public abstract remove(key: string): boolean;

  public save(path?, charset?): Promise<string> {
    return new Promise((resolve, reject) => {
      path = path || this.path;
      charset = charset || this.charset;
      let content = print(this.ast);

      fs.writeFile(path, content, charset, (err) => {
        if (err) {
          reject(err);
        }
        resolve(content);
      });
    });
  }

  public saveSync(path?, charset?): string {
    path = path || this.path;
    charset = charset || this.charset;
    let content = print(this.ast);

    fs.writeFile(path, content, charset);
    return content;
  }

  public getProperties(keys: string[]): object {
    return keys.reduce((acc, key) => {
      acc[key] = this.get(key);
      return acc;
    }, {});
  }

  public setProperties(props: object): object {
    return Object.keys(props).reduce((acc, key) => {
      acc[key] = this.set(key, props[key]);
      return acc;
    }, {});
  }

  public removeProperties(keys: string[]): object {
    return keys.reduce((acc, key) => {
      acc[key] = this.remove(key);
      return acc;
    }, {});
  }
}
