import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { HitCounter } from "./hitcounter";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

/**
 * CdkWorkshopStack represents the AWS CDK stack for the workshop.
 * This stack defines the infrastructure for a simple serverless application.
 */
export class CdkWorkshopStack extends cdk.Stack {
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function for handling hello requests
    const hello = new NodejsFunction(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler",
    });

    // Create a HitCounter to count the number of hits on the hello function
    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    // Define an API Gateway REST API resource backed by the hello function
    const gateway = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });

    // Create a TableViewer to view hit counter data
    const tv = new TableViewer(this, "ViewHitCounter", {
      title: "Hello Hits",
      table: helloWithCounter.table,
      sortBy: "-hits",
    });

    // Define CloudFormation outputs for the API Gateway URL and TableViewer URL
    this.hcEndpoint = new cdk.CfnOutput(this, "GatewayUrl", {
      value: gateway.url,
    });

    this.hcViewerUrl = new cdk.CfnOutput(this, "TableViewerUrl", {
      value: tv.endpoint,
    });
  }
}
