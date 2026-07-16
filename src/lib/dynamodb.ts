import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Amplify Hosting rejects env vars starting with "AWS_" (reserved for its own
// runtime credentials), so these use a DYNAMODB_ prefix and are passed to the
// SDK explicitly instead of relying on its default AWS_*-named env lookup.
const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION || "ap-south-1",
  ...(process.env.DYNAMODB_ACCESS_KEY_ID && process.env.DYNAMODB_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
          secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const PROJECTS_TABLE_NAME =
  process.env.PROJECTS_TABLE_NAME || "ak-constructions-projects";

export const PHONE_INDEX_NAME = "phone-index";
