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
