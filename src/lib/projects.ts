import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { STAGE_TEMPLATE } from "@/config/stages";
import { docClient, PHONE_INDEX_NAME, PROJECTS_TABLE_NAME } from "@/lib/dynamodb";
import { normalizePhone } from "@/lib/utils";
import type {
  ConstructionStage,
  CreateProjectInput,
  ProjectRecord,
  UpdateProjectInput,
} from "@/types/project";

export function calculateProgressPercent(stages: ConstructionStage[]): number {
  if (stages.length === 0) return 0;
  const completedCount = stages.filter((stage) => stage.completed).length;
  return Math.round((completedCount / stages.length) * 100);
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: PROJECTS_TABLE_NAME })
  );
  return (result.Items as ProjectRecord[]) || [];
}

export async function getProject(id: string): Promise<ProjectRecord | null> {
  const result = await docClient.send(
    new GetCommand({ TableName: PROJECTS_TABLE_NAME, Key: { id } })
  );
  return (result.Item as ProjectRecord) || null;
}

export async function getProjectsByPhone(
  phone: string
): Promise<ProjectRecord[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: PROJECTS_TABLE_NAME,
      IndexName: PHONE_INDEX_NAME,
      KeyConditionExpression: "phone = :phone",
      ExpressionAttributeValues: { ":phone": normalizePhone(phone) },
    })
  );
  return (result.Items as ProjectRecord[]) || [];
}

export async function createProject(
  input: CreateProjectInput
): Promise<ProjectRecord> {
  const now = new Date().toISOString();
  const project: ProjectRecord = {
    id: uuidv4(),
    clientName: input.clientName,
    phone: normalizePhone(input.phone),
    siteLocation: input.siteLocation,
    areaSqFt: input.areaSqFt,
    floors: input.floors,
    startedOn: input.startedOn,
    status: "on_schedule",
    stages: STAGE_TEMPLATE.map((stage) => ({
      key: stage.key,
      label: stage.label,
      completed: false,
    })),
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({ TableName: PROJECTS_TABLE_NAME, Item: project })
  );

  return project;
}

export async function updateProject(
  id: string,
  patch: UpdateProjectInput
): Promise<ProjectRecord | null> {
  const existing = await getProject(id);
  if (!existing) return null;

  const updated: ProjectRecord = {
    ...existing,
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.stages !== undefined ? { stages: patch.stages } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new UpdateCommand({
      TableName: PROJECTS_TABLE_NAME,
      Key: { id },
      UpdateExpression:
        "SET #status = :status, stages = :stages, notes = :notes, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": updated.status,
        ":stages": updated.stages,
        ":notes": updated.notes ?? null,
        ":updatedAt": updated.updatedAt,
      },
    })
  );

  return updated;
}
