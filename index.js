'use strict';

let AWS = require('aws-sdk');
let ecr = new AWS.ECR();

function cleanUpImages(repository) {
  let promise = ecr.listImages({
    repositoryName: repository,
  }).promise();

  return promise.then(data => {
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
  });
}

exports.handle = (event, context, callback) => {
  let repository = event.repository;

  cleanUpImages(repository).then(data => {
    callback(null, data);
  }).catch(err => {
    callback(err);
  });
};
