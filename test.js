(async function test() {
  const astTypes = require('ast-types');
  const recast = require('recast');
  const ConfigBuilder = require('./lib').default;

  let buildConfig;
  try {
    buildConfig = ConfigBuilder.create('./__tests__/configs/ember-cli-build.js');
  } catch (err) {
    console.error(err);
  }

  debugger
})();
