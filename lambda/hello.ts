import { APIGatewayProxyEvent } from "aws-lambda";

/**
 * Lambda function handler for API Gateway requests.
 * Returns a response with status code 200 and a simple message including the path from the event.
 * @param event APIGatewayProxyEvent object representing the incoming request
 * @returns Response object with statusCode, headers, and body
 */
export const handler = async (event: APIGatewayProxyEvent) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Good Night, CDK! You've hit ${event.path}\n`,
  };
};
