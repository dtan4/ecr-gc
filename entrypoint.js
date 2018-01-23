'use strict';

let index = require('./index.js');

if (process.env.GC_STRATEGY === undefined) {
  throw new Error('GC_STRATEGY must be set');
}

index.handle({
  repositories: process.env.REPOSITORIES === undefined ? '' : process.env.REPOSITORIES.split(','),
  strategy: process.env.GC_STRATEGY,
}, null, (error, result) => {
  if (error) {
    throw error;
  }

  console.log(result);
});
