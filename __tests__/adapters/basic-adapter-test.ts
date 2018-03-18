import * as fs from 'fs';
import tmp from 'tmp-promise';
import { builders } from '../../src/ast-utils/common';
import { BaseAdapter } from '../../src/adapters/base-adapter';

class TestAdapter extends BaseAdapter {
  private state = {};

  public get(key) {
    return this.state[key];
  }

  public set(key, val) {
    this.state[key] = val;
    return true;
  }

  public remove(key) {
    if (this.state[key]) {
      delete this.state[key];
      return true;
    }
    return false;
  }
}

it('should define getProperties method', () => {
  let adapter = new TestAdapter({ path: null, charset: null, ast: null });
  adapter.set('foo', 'bar');
  expect(adapter.getProperties(['foo'])).toEqual({ foo: 'bar' });
});

it('should define setProperties method', () => {
  let adapter = new TestAdapter({ path: null, charset: null, ast: null });
  adapter.setProperties({ foo: 'bar' });
  expect(adapter.get('foo')).toEqual('bar');
});

it('should define removeProperties method', () => {
  let adapter = new TestAdapter({ path: null, charset: null, ast: null });
  adapter.setProperties({ foo: 'bar', deleted: true });
  expect(adapter.getProperties(['foo', 'deleted'])).toEqual({
    foo: 'bar',
    deleted: true
  });
  adapter.removeProperties(['deleted']);
  expect(adapter.getProperties(['foo', 'deleted'])).toEqual({ foo: 'bar' });
});

it('should define save method', async () => {
  let file = await tmp.file();
  let anotherFile = await tmp.file();

  let adapter = new TestAdapter({
    path: file.path,
    charset: 'utf-8',
    ast: builders.literal('test')
  });

  let content = await adapter.save();
  let anotherContent = await adapter.save(anotherFile.path);

  expect(content).toEqual(anotherContent);
  expect(fs.readFileSync(file.path, 'utf-8')).toEqual(
    fs.readFileSync(anotherFile.path, 'utf-8')
  );

  // clean up tmp files
  file.cleanup();
  anotherFile.cleanup();
});
