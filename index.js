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
      return new Promise((resolve, _reject) => resolve('Repository ' + repository + ' has no untagged images. Skipped.'));
    }
  });
}

function cleanUpUntaggedImages(repositories, callback) {
  let promises = [];

  if (repositories) {
    repositories.forEach(repository => {
      promises.push(cleanUpImages(repository));
    });

    Promise.all(promises).then(data => {
      callback(null, data);
    }).catch(err => {
      callback(err);
    });
  } else {
    ecr.describeRepositories({}).promise().then(data => {
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
}

exports.handle = (event, context, callback) => {
  switch (event.strategy) {
    case 'untagged':
      cleanUpUntaggedImages(event.repositories, callback);
      break;
    default:
      callback('one of strategies ["untagged"] must be specified');
  }
};
