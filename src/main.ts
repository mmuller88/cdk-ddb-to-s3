import { App } from 'aws-cdk-lib';
import { DdbToS3Stack } from './ddb-to-s3-stack';

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new DdbToS3Stack(app, 'ddb-to-s3-stack', { env: devEnv });

app.synth();
