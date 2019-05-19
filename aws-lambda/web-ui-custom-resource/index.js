const https = require('https');
const url = require('url');
const aws = require('aws-sdk');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const s3 = new aws.S3();

const GIT_RMP_NAME = 'git-2.13.5-1.53.amzn1.x86_64.rpm';
const GIT_RMP_DOWNLOAD_URL = `http://packages.${process.env.AWS_REGION}.amazonaws.com/2017.03/updates/ba2b87ec77c7/x86_64/Packages/${GIT_RMP_NAME}`;
const GIT_RMP_DOWNLOAD_FALLBACK_URL = `http://packages.us-east-1.amazonaws.com/2017.03/updates/ba2b87ec77c7/x86_64/Packages/${GIT_RMP_NAME}`;
const GIT_DIR_NAME = '/tmp/git-2.13.5';
const CLONE_2_SUBFOLDER = 'download';

exports.handler = async function(event, context) {
  console.log('event:', JSON.stringify(event));
  try {
    let responseData = {
      PhysicalResourceId: `ui@${event.ResourceProperties.TargetBucket}`
    };

    switch (event.RequestType) {
      case 'Create':
        await fromGit2S3({
          gitRepoUrl: event.ResourceProperties.GitRepoUrl,
          gitPath: event.ResourceProperties.GitPath,
          targetBucket: event.ResourceProperties.TargetBucket
          
        });
        await s3.putObject({
          Bucket: event.ResourceProperties.TargetBucket,
          Key: 'aws-exports.js',
          Body: event.ResourceProperties.AwsExportsJs
        }).promise();
        break;
      case 'Delete':
        await deleteAllObjectsInS3Bucket(event.ResourceProperties.TargetBucket);
        break;
    }

    console.log('responseData:', JSON.stringify(responseData));
    await sendResponse(event, context, 'SUCCESS', responseData);
  } catch(e) {
    console.error(e);
    await sendResponse(event, context, 'FAILED');
  }
};

let isGitInstalled = false;

async function fromGit2S3({gitRepoUrl, gitPath, targetBucket}) {

  if (!isGitInstalled) {
      console.log(`Installing git`);
      await installGit();
      isGitInstalled = true;
  }
  process.chdir(GIT_DIR_NAME);
  await runGit(`clone --depth 1 ${gitRepoUrl} ${CLONE_2_SUBFOLDER}`);

  console.log(`Uploading ${gitPath} to S3 bucket ${targetBucket}`);

  const prefixLength = `${CLONE_2_SUBFOLDER}/${gitPath}/`.length;
  await Promise.all(
    readdirRecursive(`${CLONE_2_SUBFOLDER}/${gitPath}/`)
      .map(fileFullName => {
        const fileStream = fs.createReadStream(fileFullName);
        fileStream.on('error', console.error);
        console.log(fileFullName);
        return s3.upload({
          Bucket: targetBucket,
          Key: fileFullName.substring(prefixLength),
          Body: fileStream
        }).promise();
      })
  );
  console.log('Uploaded');

  function readdirRecursive(path) {
    let result = [];
    fs.readdirSync(path)
      .forEach(name => {
        const fullName = path + name;
        if (fs.statSync(fullName).isDirectory()) {
            result = result.concat(readdirRecursive(fullName + '/'));
        } else {
            result.push(fullName);
        }
      });
    return result;
  }

};

async function deleteAllObjectsInS3Bucket(Bucket) {
  let ContinuationToken;
  while (true) {
    const objects = await s3.listObjectsV2({Bucket, ContinuationToken}).promise();
    console.log('In deleteAllObjectsInS3Bucket. objects:', objects);
    if (!objects.KeyCount) break;
    await s3.deleteObjects({
      Bucket,
      Delete: {
        Objects: objects.Contents.map(({Key}) => ({Key}))
      }
    }).promise();
    ContinuationToken = objects.NextContinuationToken;
    if (!ContinuationToken) break;
  }
}

// Send response to the pre-signed S3 URL
function sendResponse (event, context, responseStatus, responseData) {
  let PhysicalResourceId;
  if (responseData && responseData.PhysicalResourceId) {
    PhysicalResourceId = responseData.PhysicalResourceId;
  } else if (event.PhysicalResourceId) {
    PhysicalResourceId = event.PhysicalResourceId;
  }
  const  responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: `See the details in CloudWatch Log Stream ${context.logGroupName}/${context.logStreamName}`,
    PhysicalResourceId,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData
  });
  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'PUT',
    headers: {
      'content-type': '',
      'content-length': responseBody.length
    }
  };
  return new Promise((resolve, reject) => {
    const request = https.request(
      options,
      (response) => {
        console.log('STATUS:', response.statusCode);
        console.log('HEADERS:', response.headers);
        resolve();
      });
    request.on('error', reject);
    request.write(responseBody);
    request.end();
  });
}

async function installGit() {
    await exec([
            `rm -fr ${GIT_DIR_NAME}`,
            `mkdir ${GIT_DIR_NAME}`
        ].join('&&'));
    process.chdir(GIT_DIR_NAME);
    try {
        await exec(`curl -s -O ${GIT_RMP_DOWNLOAD_URL}`);
    } catch(e) {
        console.error(e);
        await exec(`curl -s -O ${GIT_RMP_DOWNLOAD_FALLBACK_URL}`);
    }
    await exec([
            `rpm -K ${GIT_RMP_NAME}`,
            `rpm2cpio ${GIT_RMP_NAME} | cpio -id`,
            `rm ${GIT_RMP_NAME}`
        ].join('&&'));
}

async function runGit(gitCommand) {
    console.log(`Doing ${gitCommand}`);
    await exec(`GIT_EXEC_PATH=usr/libexec/git-core usr/bin/git ${gitCommand}`);
}
