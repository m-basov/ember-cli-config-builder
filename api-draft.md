## API DRAFT

```javascript

let config = new ConfigBuilder('./config/environment.js', {
  adapter: 'config-environment' // optional
});

// We are editing top-level config below
// let ENV = {
//    …
// };
// Add/edit single prop
config.set('rootURL', '/root');

// Add/edit multiple properties
config.setProperties({
  modulePrefix: 'dummy-test',
  locationType: 'history'
});

// Set non-literal properties(same works for `setProperties`)
config.set('fastboot', `{
  hostWhitelist: [/localhost:.*$/]
}`);
config.setProperties({
  plainProp: 'true',
  resolver: `(arg) => {
    return \`${arg}:module\`;
  }`
});

// Get/create environment specific config
// Code below means we will add one more env
// to default Ember App config
// …
// if (environment === 'staging') {
//   // your config here   
// }
// …
let configStaging = config.env('staging');

// API is the same as top-level config
configStaging.set('rootURL', '/staging');

config.save(/*path?: string, charset?: string*/);

```

## ADAPTERS

- `ember-cli-build.js`
- `config/environment.js`

## OPTIONS

- `path: string`
- `options?: { charset?: string, adapter?: string }`

## METHODS

- `#get(key: string): any;`
- `#set(key: string, value: any): boolean;`
- `#remove(key: string): boolean;`
- `#getProperties(keys: string[]): Object<string, any>;`
- `#setProperties(props: Object): Object<string, boolean>;`
- `#removeProperties(keys: string[]): Object<string, boolean>;`
- `#save(path?: string, charset?: string): string;`
