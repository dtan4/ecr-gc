'use strict';

let AWS = require('aws-sdk');

exports.handle = (event, context, callback) => {
  let repository = event.repository;

  let ecr = new AWS.ECR();
  let promise = ecr.listImages({
    repositoryName: repository,
  }).promise();

  promise.then(data => {
    let imageIds = [];

    data.imageIds.forEach(image => {
      if (!image.imageTag) {
        console.log('image ' + image.imageDigest + ' will be deleted.');

        imageIds.push({
          imageDigest: image.imageDigest,
        });
      }
    });

    return ecr.batchDeleteImage({
      imageIds: imageIds,
      repositoryName: repository,
    }).promise();
  }).then(data => {
    callback(null, data);
  }).catch(err => {
    callback(err);
  });
};
