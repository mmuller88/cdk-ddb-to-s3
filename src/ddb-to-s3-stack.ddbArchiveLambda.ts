// eslint-disable-next-line import/no-extraneous-dependencies
import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

const ddbArchiveBucketName = process.env.DDB_ARCHIVE_BUCKET_NAME || '';

export async function handler(event: lambda.DynamoDBStreamEvent) {
  console.debug(`event: ${JSON.stringify(event)}`);
  let removedLogs: Log[] = [];
  event.Records.map((record) => {
    if (record.eventName === 'REMOVE' && record.dynamodb?.OldImage) {
      const removedLog = AWS.DynamoDB.Converter.unmarshall(
        record.dynamodb?.OldImage,
      ) as Log;
      removedLogs.push(removedLog);
    }
  });

  if (removedLogs.length === 0) {
    return;
  }

  console.debug(`removedLogs: ${JSON.stringify(removedLogs)}`);

  // you could generate a new timestamp here but for me I would like to use the existing one from the ddb item event
  const dateNow = removedLogs[0].timestamp;

  const putObjectParams: AWS.S3.Types.PutObjectRequest = {
    Bucket: ddbArchiveBucketName,
    Key: `${dateNow}.json`,
    Body: JSON.stringify(removedLogs),
  };

  await s3.putObject(putObjectParams).promise();
}

interface Log {
  systemId: number;
  timestamp: number;
  level: number;
  message: string;
  module: string;
}
