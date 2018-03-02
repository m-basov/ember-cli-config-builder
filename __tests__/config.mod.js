'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy-test',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    objectProp: {
      shouldBeMerged: 'yes',
      merged: false
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'staging') {
    ENV.rootURL = '/staging';
    ENV.objectProp = {
      shouldBeMerged: 'yes',
      merged: true,
      newProp: true
    };
    ENV.EmberENV.FEATURES['with-controller'] = true;
    ENV.EmberENV.EXTEND_PROTOTYPES.Date = true;
    ENV.APP.testFlag = 'test';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    ENV.rootURL = '/production';
    // here you can enable a production-specific feature
  }

  return ENV;
};
