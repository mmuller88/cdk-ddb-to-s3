import * as core from 'aws-cdk-lib';

import { Stack, StackProps } from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdajs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class DdbToS3Stack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const ddbTable = new ddb.Table(this, 'ddbTable', {
      partitionKey: { name: 'systemId', type: ddb.AttributeType.NUMBER },
      sortKey: { name: 'timestamp', type: ddb.AttributeType.NUMBER },
      stream: ddb.StreamViewType.OLD_IMAGE,
      timeToLiveAttribute: 'ttl',
    });

    const ddbArchiveBucket = new s3.Bucket(this, 'ddbArchiveBucket');

    const ddbArchiveLambda = new lambdajs.NodejsFunction(
      this,
      'ddbArchiveLambda',
      {
        reservedConcurrentExecutions: 1,
        environment: {
          DDB_ARCHIVE_BUCKET_NAME: ddbArchiveBucket.bucketName,
        },
      },
    );
    ddbTable.grantStreamRead(ddbArchiveLambda);
    ddbArchiveBucket.grantWrite(ddbArchiveLambda);

    ddbArchiveLambda.addEventSourceMapping('archivelog', {
      // max json document is 4 mb per file
      batchSize: 10000,
      maxBatchingWindow: core.Duration.minutes(5),
      eventSourceArn: ddbTable.tableStreamArn,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      bisectBatchOnError: true,
    });
  }
}
