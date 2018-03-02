const pify = require('pify');
const fs = pify(require('fs'));
const path = require('path');
const tmp = pify(require('tmp'));
const AppConfigBuilder = require('../lib').default;

const CHARSET = 'utf-8';
const CONFIG_ORIG_PATH = path.resolve('./__tests__/config.orig.js');
const CONFIG_MOD_PATH = path.resolve('./__tests__/config.mod.js');

it('should modify config', async () => {
  let config = new AppConfigBuilder(CONFIG_ORIG_PATH);
  await config.readFile();

  let resultFile = await tmp.file();

  await config.writeFile(resultFile);

  let result = await fs.readFile(resultFile, CHARSET)
  let modifiedConfig = await fs.readFile(CONFIG_MOD_PATH, CHARSET);

  expect(result).toEqual(modifiedConfig);
});
