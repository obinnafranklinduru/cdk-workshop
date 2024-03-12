import * as cdk from "aws-cdk-lib";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { WorkshopPipelineStage } from "./pipeline-stage";

/**
 * WorkshopPipelineStack represents the AWS CDK stack for the workshop pipeline.
 * This stack defines the infrastructure for continuous integration and continuous deployment (CI/CD) of the application.
 */
export class WorkshopPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a CodeCommit repository named 'WorkshopRepo'
    const repo = new codecommit.Repository(this, "WorkshopRepo", {
      repositoryName: "WorkshopRepo",
    });

    // Define the pipeline for CI/CD
    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "WorkshopPipeline",
      synth: new CodeBuildStep("SynthStep", {
        input: CodePipelineSource.codeCommit(repo, "main"),
        installCommands: ["npm install -g aws-cdk"],
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    // Add deployment stage to the pipeline
    const deploy = new WorkshopPipelineStage(this, "Deploy");
    const deployStage = pipeline.addStage(deploy);

    // Add post-deployment tests
    deployStage.addPost(
      new CodeBuildStep("TestViewerEndpoint", {
        projectName: "TestViewerEndpoint",
        envFromCfnOutputs: {
          ENDPOINT_URL: deploy.hcViewerUrl,
        },
        commands: ["curl -Ssf $ENDPOINT_URL"],
      }),
      new CodeBuildStep("TestAPIGatewayEndpoint", {
        projectName: "TestAPIGatewayEndpoint",
        envFromCfnOutputs: {
          ENDPOINT_URL: deploy.hcEndpoint,
        },
        commands: [
          "curl -Ssf $ENDPOINT_URL",
          "curl -Ssf $ENDPOINT_URL/hello",
          "curl -Ssf $ENDPOINT_URL/test",
        ],
      })
    );
  }
}
