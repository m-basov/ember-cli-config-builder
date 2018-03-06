const astTypes = require('ast-types');
const recast = require('recast');
const ConfigBuilder = require('./lib').default;

let environmentConfig;
let stagingConfig;
let productionConfig;
try {
  environmentConfig = ConfigBuilder.create('./__tests__/configs/environment.js');
  productionConfig = environmentConfig.env('production');
  stagingConfig = environmentConfig.env('staging');

  console.log('first', productionConfig.get('first.one.two.three'));
  // console.log('second', productionConfig.get('second.one.two.three'));
  // productionConfig.get('third.one.two.three');
  // productionConfig.get('fourth.one.two.three');
  // console.log('get node.none', productionConfig.get('node.none'));

  // let buildConfig = ConfigBuilder.create('./__tests__/configs/ember-cli-build.js');
} catch (err) {
  console.error(err);
}

debugger
