import ConfigBuilder from '../../src';
import tmp from 'tmp-promise';

it('should get values from app config', async () => {
  let buildConfig = await ConfigBuilder.create(
    './__tests__/configs/ember-cli-build.js'
  );
  expect(buildConfig.get('ember-cli-babel.includePolyfill')).toEqual('true');
  expect(buildConfig.get('non-existed')).toEqual('');
});

it('should set values to app config', async () => {
  let buildConfig = await ConfigBuilder.create(
    './__tests__/configs/ember-cli-build.js'
  );
  buildConfig.set('ember-medium-editor', '{}');
  buildConfig.set('ember-medium-editor.theme', '\'default\'');
  expect(buildConfig.get('ember-medium-editor')).toContain('theme: \'default\'');
});

it('should remove value from app config', async () => {
  let buildConfig = await ConfigBuilder.create(
    './__tests__/configs/ember-cli-build.js'
  );
  buildConfig.remove('ember-cli-babel.includePolyfill');
  buildConfig.remove('babel');
  expect(buildConfig.get('ember-cli-babel')).toEqual('{}');
  expect(buildConfig.get('babel')).toEqual('');
});

it('should add import', async () => {
  let buildConfig = await ConfigBuilder.create(
    './__tests__/configs/ember-cli-build.js'
  );
  buildConfig.addImport('test-import.js');
  let file = await tmp.file();
  let content = await buildConfig.save(file.path);
  expect(content).toContain('app.import(\'test-import.js\')');
  file.cleanup();
});

it('should remove import', async () => {
  let file = await tmp.file();
  let buildConfig = await ConfigBuilder.create(
    './__tests__/configs/ember-cli-build.js'
  );

  buildConfig.addImport('test-import.js');

  let content = await buildConfig.save(file.path);
  expect(content).toContain('app.import(\'test-import.js\')');

  buildConfig.removeImport('test-import.js');

  content = await buildConfig.save(file.path);
  expect(content).not.toContain('test-import.js');

  file.cleanup();
});
