#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkWorkshopStack } from "../lib/cdk-workshop-stack";

const app = new cdk.App();
new CdkWorkshopStack(app, "CdkWorkshopStack", {
  env: {
    account: "940593862958",
    region: "us-east-1",
  },
});
