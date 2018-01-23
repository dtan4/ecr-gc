'use strict';

let index = require('./index.js');

if (process.env.REPOSITORIES === undefined) {
  throw new Error('REPOSITORIES must be set');
}

if (process.env.GC_STRATEGY === undefined) {
  throw new Error('GC_STRATEGY must be set');
}

index.handle({
  repositories: process.env.REPOSITORIES.split(','),
  strategy: process.env.GC_STRATEGY,
}, null, (error, result) => {
  if (error) {
    throw error;
  }

  console.log(result);
});
