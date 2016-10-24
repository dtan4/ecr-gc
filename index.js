'use strict';

let AWS = require('aws-sdk');
let ecr = new AWS.ECR();

function cleanUpImages(repository) {
  let promise = ecr.listImages({
    repositoryName: repository,
    filter: {
      tagStatus: 'UNTAGGED',
    }
  }).promise();

  return promise.then(data => {
    let imageIds = [];

    data.imageIds.forEach(image => {
      console.log('image ' + image.imageDigest + ' will be deleted.');

      imageIds.push({
        imageDigest: image.imageDigest,
      });
    });

    if (imageIds.length > 0) {
      return ecr.batchDeleteImage({
        imageIds: imageIds,
        repositoryName: repository,
      }).promise();
    } else {
      return new Promise((resolve, _) => resolve('Repository ' + repository + ' has no untagged images. Skipped.'));
    }
  });
}

exports.handle = (event, context, callback) => {
  if (event.repository) {
    let repository = event.repository;

    cleanUpImages(repository).then(data => {
      callback(null, data);
    }).catch(err => {
      callback(err);
    });
  } else {
    ecr.describeRepositories({}).promise().then(data => {
      let promises = [];

      data.repositories.forEach(repository => {
        promises.push(cleanUpImages(repository.repositoryName));
      });

      return Promise.all(promises);
    }).then(data => {
      callback(null, data);
    }).catch(err => {
      callback(err);
    });
  }
};
