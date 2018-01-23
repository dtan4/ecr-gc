'use strict';

let index = require('./index.js');

index.handle({
  strategy: process.env.GC_STRATEGY,
}, null, (error, result) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(result);
});
