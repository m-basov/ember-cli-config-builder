(async function test() {
  const astTypes = require('ast-types');
  const recast = require('recast');
  const ConfigBuilder = require('./lib').default;

  let environmentConfig;
  let stagingConfig;
  let productionConfig;

  try {
    environmentConfig = await ConfigBuilder.create('./__tests__/configs/environment.js');
    productionConfig = environmentConfig.env('production');
    stagingConfig = environmentConfig.env('staging');

    console.log('first', productionConfig.get('first.one.two.three'));

    console.log('second', productionConfig.get('second.one.two'));

    console.log('third', productionConfig.get('third.one'));

    console.log('fourth', productionConfig.get('fourth.one.two.three'));

    console.log('none', productionConfig.get('node.none'));

    console.log('string-pat', productionConfig.get('string-path'));

    console.log('rootUrl', productionConfig.get('rootURL'));

    // productionConfig.set('rootURL', "'/test'");
    // productionConfig.set('newProp.string-path', 'true');

    // let buildConfig = ConfigBuilder.create('./__tests__/configs/ember-cli-build.js');
  } catch (err) {
    console.error(err);
  }

  debugger
})();
