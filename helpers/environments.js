// dependencis

// environments module

const environments = {};

environments.staging = {
     port: 3000,
     envName: 'staging',
     secretKey: 'ifhijcbeyvfehnsk',
     maxChecks: 5,
     twilio: {
          FromPhone: '',
          accountSid: '',
          authToken: '',
     }
};

environments.production = {
     port: 5000,
     envName: 'production',
     secretKey: 'kfioenfijenfakd',
     maxChecks: 5,
     twilio: {
          FromPhone: '',
          accountSid: '',
          authToken: '',
     },
};

const currentEnvironment =
     typeof (process.env.NODE_ENV) === 'string'
          ? process.env.NODE_ENV
          : 'staging';

const environmentToExport =
     typeof (environments[currentEnvironment]) === 'object'
          ? environments[currentEnvironment]
          : environments.staging;

// export module
module.exports = environmentToExport;