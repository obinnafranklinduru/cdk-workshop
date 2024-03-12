#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { WorkshopPipelineStack } from "../lib/pipeline-stack";

/**
 * Entry point for the CDK application.
 * Creates the WorkshopPipelineStack and deploys it.
 */
const app = new cdk.App();
new WorkshopPipelineStack(app, "CdkWorkshopPipelineStack");
