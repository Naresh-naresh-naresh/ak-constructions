import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const PROJECTS_TABLE_NAME =
  process.env.PROJECTS_TABLE_NAME || "ak-constructions-projects";

export const PHONE_INDEX_NAME = "phone-index";
