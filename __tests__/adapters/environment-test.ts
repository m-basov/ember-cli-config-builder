import ConfigBuilder from '../../src';

it('should get value from default env', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  expect(envConfig.get('locationType')).toEqual("'auto'");
  expect(envConfig.get('EmberENV.EXTEND_PROTOTYPES.Date')).toEqual('false');
  expect(envConfig.get('nonExisted')).toEqual('');
});

it('should set value to default env', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  envConfig.set('locationType', "'history'");
  envConfig.set('EmberENV.EXTEND_PROTOTYPES.Date', 'true');
  envConfig.set('newVar', 'true');
  expect(envConfig.get('locationType')).toEqual("'history'");
  expect(envConfig.get('EmberENV.EXTEND_PROTOTYPES.Date')).toEqual('true');
  expect(envConfig.get('newVar')).toEqual('true');
});

it('should remove value from default env', async () => {
  let envConfig = await ConfigBuilder.create(
    './__tests__/configs/environment.js'
  );
  envConfig.remove('locationType');
  envConfig.remove('EmberENV.EXTEND_PROTOTYPES.Date');
  envConfig.remove('newVar');
  expect(envConfig.get('locationType')).toEqual('');
  expect(envConfig.get('EmberENV.EXTEND_PROTOTYPES.Date')).toEqual('');
});
