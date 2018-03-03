const astTypes = require('ast-types');
const recast = require('recast');
const ConfigBuilder = require('./lib').default;

let environmentConfig = ConfigBuilder.create('./__tests__/configs/environment.js');
let environmentStagingConfig = environmentConfig.env('staging');
// let buildConfig = ConfigBuilder.create('./__tests__/configs/ember-cli-build.js');

debugger
