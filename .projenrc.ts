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
  devDeps: ['@types/aws-lambda', 'cdk-dia'],
});

// Always update the diagram if manually synth
project.cdkTasks.synth.exec('yarn cdk-dia && mv diagram.png diagrams/all.png');

project.gitignore.addPatterns('diagram.dot', 'diagram.png');

project.synth();
