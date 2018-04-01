import ConfigBuilder from '../src';
import { BaseAdapter } from '../src/adapters/base-adapter';

it('should auto-detect adapter', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  let buildConfig = await ConfigBuilder.create(
    './__tests__/configs/ember-cli-build.js'
  );
  expect(envConfig.get('rootURL')).toEqual("'/'");
  expect(buildConfig.get('ember-cli-babel.includePolyfill')).toEqual('true');
});

it('should register custom adapter', () => {
  let adapters = ConfigBuilder.registerAdapter(
    'custom',
    class extends BaseAdapter {
      public get(key) {
        return key;
      }
      public set(_key, _value) {
        return true;
      }
      public remove(_key) {
        return true;
      }
    }
  );
  expect(adapters.custom).toBeTruthy();
});

it('should allow to specify adapter and charset', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/renamed-env.js',
    {
      adapter: 'environment',
      charset: 'utf-8'
    }
  );
  expect(envConfig.get('rootURL')).toEqual("'/'");
});

it('should allow to parse raw values from #get() into JS values', () => {
  [
    { raw: "'string'", parsed: 'string' },
    { raw: '3', parsed: 3 },
    { raw: 'true', parsed: true },
    { raw: "[1, '2', true, null]", parsed: [1, '2', true, null] },
    { raw: '{ obj: [true] }', parsed: { obj: [true] } }
  ].forEach((val) => {
    expect(ConfigBuilder.parse(val.raw)).toEqual(val.parsed);
  });
});

it('should allow to stringify values', () => {
  [
    { raw: 'string', string: "'string'" },
    { raw: 3, string: '3' },
    { raw: true, string: 'true' },
    { raw: [1, '2', true, null], string: "[1,'2',true,null]" },
    { raw: { obj: [true] }, string: '{obj:[true]}' }
  ].forEach((val) => {
    expect(ConfigBuilder.stringify(val.raw)).toEqual(val.string);
  });
});

it('should define createSync method', () => {
  let envConfig = ConfigBuilder.createSync('./__tests__/configs/environment.js');
  expect(envConfig.get('rootURL')).toEqual("'/'");
});
