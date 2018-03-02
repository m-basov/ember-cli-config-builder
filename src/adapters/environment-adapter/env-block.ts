import { BaseAdapter } from '../base-adapter';

export class EnvBlock extends BaseAdapter {
  // private name;

  constructor(opts) {
    super(opts);
    // this.name = opts.name;
    // console.log('env-block name:', opts.name);
  }

  set(key, value) {
    console.log('env-block set:', key, value);
    return false;
  }

  get(key) {
    console.log('env-block get:', key);
  }

  remove(key) {
    console.log('env-block remove:', key);
    return false;
  }
}
