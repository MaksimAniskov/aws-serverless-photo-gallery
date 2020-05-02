const https = require('https');
const url = require('url');
const unzipper = require('unzipper');
const mime = require('mime/lite');
const aws = require('aws-sdk');
const s3 = new aws.S3();

exports.handler = async function (event, context) {
  console.log('event:', JSON.stringify(event));
  try {
    let responseData = {
      PhysicalResourceId: `ui@${event.ResourceProperties.TargetBucket}`
    };

    switch (event.RequestType) {
      case 'Create':
      case 'Update':
        await fromGit2S3({
          gitArchiveUrl: event.ResourceProperties.GitArchiveUrl,
          gitPath: event.ResourceProperties.GitPath,
          targetBucket: event.ResourceProperties.TargetBucket
        });
        await s3.putObject({
          Bucket: event.ResourceProperties.TargetBucket,
          Key: 'aws-exports.js',
          Body: event.ResourceProperties.AwsExportsJs,
          ContentType: 'text/javascript'
        }).promise();
        break;
      case 'Delete':
        await deleteAllObjectsInS3Bucket(event.ResourceProperties.TargetBucket);
        break;
    }

    console.log('responseData:', JSON.stringify(responseData));
    await sendResponse(event, context, 'SUCCESS', responseData);
  } catch (e) {
    console.error(e);
    await sendResponse(event, context, 'FAILED');
  }
};

async function fromGit2S3({ gitArchiveUrl, gitPath, targetBucket }) {
  return new Promise((resolve, reject) => {
    const regexp = `.*/${gitPath}/(.*\\.([^.]+))`;

    https.get(gitArchiveUrl, async (res) => {
      res
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          const match = entry.path.match(regexp);
          if (!match) {
            entry.autodrain();
            return;
          }

          const fileName = match[1];
          const fileExtension = match[2];
          console.log(fileName);

          await s3.putObject({
            Bucket: targetBucket,
            Key: fileName,
            Body: await entry.buffer(),
            ContentType: mime.getType(fileExtension)
          }).promise();
        })
        .on('error', reject)
        .on('finish', resolve)
    });
  });
}

async function deleteAllObjectsInS3Bucket(Bucket) {
  let ContinuationToken;
  while (true) {
    const objects = await s3.listObjectsV2({ Bucket, ContinuationToken }).promise();
    console.log('In deleteAllObjectsInS3Bucket. objects:', objects);
    if (!objects.KeyCount) break;
    await s3.deleteObjects({
      Bucket,
      Delete: {
        Objects: objects.Contents.map(({ Key }) => ({ Key }))
      }
    }).promise();
    ContinuationToken = objects.NextContinuationToken;
    if (!ContinuationToken) break;
  }
}

// Send response to the pre-signed S3 URL
function sendResponse(event, context, responseStatus, responseData) {
  let PhysicalResourceId;
  if (responseData && responseData.PhysicalResourceId) {
    PhysicalResourceId = responseData.PhysicalResourceId;
  } else if (event.PhysicalResourceId) {
    PhysicalResourceId = event.PhysicalResourceId;
  }
  const responseBody = JSON.stringify({
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
