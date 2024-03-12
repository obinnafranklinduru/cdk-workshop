import { Template, Capture, Match } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import { HitCounter } from "../lib/hitcounter";

// Test if DynamoDB Table is created
test("DynamoDB Table Created", () => {
  // Arrange
  const stack = new cdk.Stack();

  // Act
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new NodejsFunction(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler",
    }),
  });

  // Assert
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

// Test if Lambda Function has required Environment Variables
test("Lambda Has Environment Variables", () => {
  // Arrange
  const stack = new cdk.Stack();

  // Act
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new NodejsFunction(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler",
    }),
  });

  // Assert
  const template = Template.fromStack(stack);
  const envCapture = new Capture({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: Match.stringLikeRegexp("TestFunction*"),
      },
      HITS_TABLE_NAME: {
        Ref: Match.stringLikeRegexp("MyTestConstructHits*"),
      },
    },
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: "TestFunction22AD90FC",
      },
      HITS_TABLE_NAME: {
        Ref: "MyTestConstructHits24A357F0",
      },
    },
  });
});

// Detailed testing on read capacity constraints
describe("Read Capacity can be configured", () => {
  // Test setting read capacity to invalid values
  test("can't set read capacity to 3", () => {
    // Act & Assert
    const stack = new cdk.Stack();
    expect(() => {
      new HitCounter(stack, "MyTestConstruct", {
        downstream: new NodejsFunction(stack, "TestFunction", {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, "../lambda/hello.ts"),
          handler: "handler",
        }),
        readCapacity: 3,
      });
    }).toThrow(
      new Error("readCapacity must be greater than 5 and less than 20")
    );
  });

  // Test setting read capacity to another invalid value
  test("can't set read capacity to 25", () => {
    // Act & Assert
    const stack2 = new cdk.Stack();
    expect(() => {
      new HitCounter(stack2, "MyTestConstruct", {
        downstream: new NodejsFunction(stack2, "TestFunction", {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, "../lambda/hello.ts"),
          handler: "handler",
        }),
        readCapacity: 25,
      });
    }).toThrow(
      new Error("readCapacity must be greater than 5 and less than 20")
    );
  });

  // Test setting read capacity to a valid value
  test("can set read capacity to 12", () => {
    // Act & Assert
    const stack3 = new cdk.Stack();
    expect(() => {
      new HitCounter(stack3, "MyTestConstruct", {
        downstream: new NodejsFunction(stack3, "TestFunction", {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, "../lambda/hello.ts"),
          handler: "handler",
        }),
        readCapacity: 12,
      });
    }).toThrow(
      new Error("readCapacity must be greater than 5 and less than 20")
    );
  });
});
