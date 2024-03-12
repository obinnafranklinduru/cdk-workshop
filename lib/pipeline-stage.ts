import { CdkWorkshopStack } from "./cdk-workshop-stack";
import { Stage, CfnOutput, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";

/**
 * WorkshopPipelineStage represents the deployment stage in the pipeline.
 * It deploys the CdkWorkshopStack as a single unit.
 */
export class WorkshopPipelineStage extends Stage {
  public readonly hcViewerUrl: CfnOutput;
  public readonly hcEndpoint: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    // Create the service stack
    const service = new CdkWorkshopStack(this, "WebService");

    // Retrieve CloudFormation outputs from the service stack
    this.hcEndpoint = service.hcEndpoint;
    this.hcViewerUrl = service.hcViewerUrl;
  }
}
