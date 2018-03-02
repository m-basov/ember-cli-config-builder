import { BaseAdapter } from './base-adapter';

export class EmberCliBuildAdapter extends BaseAdapter {
  constructor(opts) {
    super(opts);
    // console.log('ember-cli-build ast:', opts.ast);
  }

  set(key, value) {
    console.log('ember-cli-build set:', key, value);
    return false;
  }

  get(key) {
    console.log('ember-cli-build-adapter get:', key);
  }

  remove(key) {
    console.log('ember-cli-build remove:', key);
    return false;
  }

  addImport(path) {
    console.log('ember-cli-build addImport:', path);
  }

  removeImport(path) {
    console.log('ember-cli-build removeImport:', path);
  }
}
