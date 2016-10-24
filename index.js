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

    return ecr.batchDeleteImage({
      imageIds: imageIds,
      repositoryName: repository,
    }).promise();
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

exports.handle({}, null, (err, msg) => { console.log(err); console.log(msg); });
