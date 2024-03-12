import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

/**
 * HitCounterProps defines the properties for the HitCounter construct.
 */
export interface HitCounterProps {
  /** The function for which we want to count URL hits. */
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table.
   * Must be greater than 5 and lower than 20.
   * @default 5
   */
  readCapacity?: number;
}

/**
 * HitCounter represents a construct to count hits on a given function.
 * It creates a DynamoDB table to store hit counts and associates a Lambda function to count hits.
 */
export class HitCounter extends Construct {
  /** Allows accessing the counter function. */
  public readonly handler: lambda.Function;

  /** The hit counter table. */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    // Validate readCapacity
    if (
      props.readCapacity !== undefined &&
      (props.readCapacity < 5 || props.readCapacity > 20)
    ) {
      throw new Error("readCapacity must be greater than 5 and less than 20");
    }
    super(scope, id);

    // Create DynamoDB table to store hit counts
    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      readCapacity: props.readCapacity ?? 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.table = table;

    // Create Lambda function to count hits
    this.handler = new NodejsFunction(this, "HitCounterHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/hitcounter.ts"),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    // Grant Lambda role read/write permissions to the table
    table.grantReadWriteData(this.handler);

    // Grant Lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
  }
}
