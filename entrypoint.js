'use strict';

let index = require('./index.js');

index.handle({
  strategy: process.env.GC_STRATEGY,
}, null, (error, result) => {
  if (error) {
    throw error;
  }

  console.log(result);
});
