import * as pj from 'projen';
import { TrailingComma } from 'projen/lib/javascript';

const project = new pj.awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-ddb-to-s3',
  projenrcTs: true,
  eslint: true,
  prettier: true,
  prettierOptions: {
    settings: {
      singleQuote: true,
      trailingComma: TrailingComma.ALL,
    },
  },
  deps: ['aws-lambda', 'aws-sdk'],
  devDeps: ['@types/aws-lambda'],
});
project.synth();
