import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — remove once the Amplify env var issue is confirmed fixed.
// Reports only presence/length, never actual secret values.
export async function GET() {
  const check = (value: string | undefined) => ({
    present: Boolean(value),
    length: value?.length ?? 0,
  });

  return NextResponse.json({
    NEXTAUTH_SECRET: check(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: check(process.env.NEXTAUTH_URL),
    ADMIN_USERNAME: check(process.env.ADMIN_USERNAME),
    ADMIN_PASSWORD_HASH: check(process.env.ADMIN_PASSWORD_HASH),
    PROJECTS_TABLE_NAME: check(process.env.PROJECTS_TABLE_NAME),
    DYNAMODB_REGION: check(process.env.DYNAMODB_REGION),
    DYNAMODB_ACCESS_KEY_ID: check(process.env.DYNAMODB_ACCESS_KEY_ID),
    DYNAMODB_SECRET_ACCESS_KEY: check(process.env.DYNAMODB_SECRET_ACCESS_KEY),
  });
}
