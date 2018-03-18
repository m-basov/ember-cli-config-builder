import ConfigBuilder from '../../src';
import tmp from 'tmp-promise';

it('should create env block if not exists', async () => {
  let file = await tmp.file();
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  let stagingConfig = envConfig.env('staging');
  let content = await stagingConfig.save(file.path);
  expect(content).toContain("environment === 'staging'");
  file.cleanup();
});

it('should get variable fron env block', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  let testConfig = envConfig.env('test');
  expect(testConfig.get('locationType')).toEqual("'none'");
  expect(testConfig.get('APP.LOG_ACTIVE_GENERATION')).toEqual('false');
  expect(testConfig.get('non-existed')).toEqual('');
});

it('should set variable to env block', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  let testConfig = envConfig.env('test');
  testConfig.set('locationType', "'history'");
  testConfig.set('APP.LOG_ACTIVE_GENERATION', 'true');
  testConfig.set('newVar', 'true');
  expect(testConfig.get('locationType')).toEqual("'history'");
  expect(testConfig.get('APP.LOG_ACTIVE_GENERATION')).toEqual('true');
  expect(testConfig.get('newVar')).toEqual('true');
});

it('should remove variable from env block', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  let testConfig = envConfig.env('test');
  testConfig.remove('locationType');
  testConfig.remove('APP.LOG_ACTIVE_GENERATION');
  expect(testConfig.get('locationType')).toEqual('');
  expect(testConfig.get('APP.LOG_ACTIVE_GENERATION')).toEqual('');
});
