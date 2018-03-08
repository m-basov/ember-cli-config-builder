# ember-cli-config-builder

Extensible library to edit Ember’s config files with familiar API.

## NOT PUBLISHED YET

## Installation
- with ember `$ ember install ember-cli-config-builder`
- with npm `$ npm install --save ember-cli-config-builder`
- with yarn `$ yarn add ember-cli-config-builder`

## Basic Usage
```javascript
// Import library
const ConfigBuilder = require('ember-cli-config-builder');

// Create builder instance. Notice: it is async operation which returns
// Promise because async fs.readFile method is used to read file contents
let config = await ConfigBuilder.create('./my-addon/config/environment.js');

// Read variables with #get(path) method. Notice: it is always returns string
// with raw value. Example: "'string value'", 'true', '{ object: true }' etc
config.get('rootURL'); // "'/'"
// Read nested values with dot-separated path
config.get('EmberENV.EXTEND_PROTOTYPES.Date'); // 'false'
// Read multiple values at once
config.get(['modulePrefix', 'locationType']); // { modulePrefix: "'dummy'", locationType: "'auto'" }

// Change existing properties with #set(path, value) method. It returns true
// if set was successful or false otherwise
config.set('rootURL', "'/dev'"); // true
// Create a new poperty
config.set('myNewProp', '{}'); // true
// Change nested properties
config.set('EmberENV.EXTEND_PROTOTYPES.Date', 'true'); // true
// Change or create multiple properties at once
config.setProperties({ 'myNewProp.child': "'works'", 'rootURL.child': "'rootURL is not an object'" }); // { 'myNewProp.child': true, 'rootURL.child': false }

// Or remove properties entirely with #remove(path) method. It returns true
// if key was found and removed and false otherwise
config.remove('rootURL'); // true
// You can remove only child keys.
config.remove('myNewProp.child'); // true
// Multiple remove is available as well
config.removeProperties(['myNewProp', 'modulePrefix']); // { myNewProp: true, modulePrefix: true }

// After editing is done there are a few options to save result.
// The most straightforward is save to the same file.
// Notice: this method is async as well because of usage non-blocking 
// fs.writeFile method
await config.save(); // will write changes to disk and return string with file content
// Or you can write changes to another file
await config.save('./my-addon/config/new-environment.js');
// See Advanced Usage section for more use cases
```

## Advanced Usage
TODO: write this :)

## Contributing
### Installation
`git clone git@github.com:kolybasov/ember-cli-config-builder.git`
`cd ember-cli-config-builder`
`yarn install`

### Running tests
`yarn test` – Runs jest tests

## License
This project is licensed under the [MIT License](./LICENSE.md).
