# ecr-gc

AWS Lambda function / Docker image to clean up untagged images stored in ECR.

## Why

The default maxinum number of images per one ECR repository is 1000.
In addition, users are changed with storage pricing: $0.10 per GB-month.

- [Amazon ECR Service Limits - Amazon ECR](http://docs.aws.amazon.com/AmazonECR/latest/userguide/service_limits.html)
- [AWS | Amazon EC2 Container Service | Pricing](https://aws.amazon.com/ecr/pricing/)

If you build new image and push to ECR frequently, this repository capacity will be filled up soon.

By the way, most images which are _untagged_ (= old) image may be no longer needed. We have no reason to retain unnecessary image for a long time.

Why don't you delete unnecessary images to save cost?

## Install

### IAM Role

These 3 operation must be authorized:

- `ecr:BatchDeleteImage`
- `ecr:DescribeRepositories`
- `ecr:ListImages`

You can deploy this function as a part of [Apex](http://apex.run/) project, standalone Lambda function or Kubernetes CronJob.

### 1. Apex project

Add ecr-gc to your Apex project:

```bash
$ git submodule add https://github.com/dtan4/ecr-gc.git functions/ecr-gc
```

Deploy it:

```bash
$ apex deploy ecr-gc
```

Try it:

```bash
$ cp functions/ecr-gc/event.json.sample functions/ecr-gc/event.json
$ vim functions/ecr-gc/event.json
$ cat functions/ecr-gc/event.json
{
  "strategy": "untagged",
  "repositories": [
    "reponame"
  ]
}
$ apex invoke ecr-gc < functions/ecr-gc/event.json
```

If `repositories` is empty, ALL repositories will be cleaned up.

```bash
$ cat functions/ecr-gc/event.json
{
  "strategy": "untagged"
}
$ apex invoke ecr-gc < functions/ecr-gc/event.json
```

### 2. Standalone

Build .zip package:

```bash
$ npm install
$ npm run dist
```

Upload `dist/ecr-gc.zip` via Management Console or awscli.

### 3. Kubernetes CronJob

Set these Secrets:

|name|key|description|
|----|---|-----------|
|`dotenv`|`AWS_ACCESS_KEY_ID`|AWS access key ID|
|`dotenv`|`AWS_SECRET_ACCESS_KEY`|AWS secret access key|
|`dotenv`|`AWS_REGION`|AWS region|
|`dotenv`|`GC_STRATEGY`|GC strategy (only `untagged` is supported)|
|`dotenv`|`REPOSITORIES`|comma-separated target ECR repositories (if empty, all repositories will be GCed)|

deploy CronJob resource:

```bash
kubectl create -f kubernetes/cronjob.yaml [-n NAMESPACE]
```

`ecr-gc` Job will be invoked at 0:30 GMT in default.

## License

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
