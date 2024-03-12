import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

/**
 * Lambda function handler for API Gateway requests.
 * Updates hit count in DynamoDB, calls downstream function, and returns its response.
 * @param event APIGatewayProxyEvent object representing the incoming request
 * @returns Response from the downstream function
 */
export const handler = async function (event: APIGatewayProxyEvent) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // Create AWS SDK clients
  const dynamoClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamoClient);
  const lambdaClient = new LambdaClient();

  // Update DynamoDB entry for "path" with hits++
  const updateInput = {
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: event.path },
    UpdateExpression: "ADD hits :incr",
    ExpressionAttributeValues: { ":incr": 1 },
  };
  const updateCommand = new UpdateCommand(updateInput);
  await docClient.send(updateCommand);

  // Call downstream function and capture response
  const invokeInput = {
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event),
  };
  const command = new InvokeCommand(invokeInput);
  const response = await lambdaClient.send(command);

  console.log("downstream response:", JSON.stringify(response, undefined, 2));

  // Return response back to upstream caller
  return JSON.parse(Buffer.from(response.Payload || "").toString("utf8"));
};
