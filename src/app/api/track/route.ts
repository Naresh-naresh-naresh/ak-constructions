import { NextResponse } from "next/server";
import {
  calculateProgressPercent,
  getProjectsByPhone,
  recordProjectCheck,
} from "@/lib/projects";
import { normalizePhone } from "@/lib/utils";
import type { PublicProjectStatus } from "@/types/project";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") || "";
  const normalized = normalizePhone(phone);

  if (normalized.length !== 10) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit mobile number" },
      { status: 400 }
    );
  }

  try {
    const projects = await getProjectsByPhone(normalized);

    if (projects.length === 0) {
      return NextResponse.json(
        { error: "No project found for this mobile number" },
        { status: 404 }
      );
    }

    try {
      await Promise.all(projects.map((project) => recordProjectCheck(project.id)));
    } catch (error) {
      console.error("Failed to record project check:", error);
    }

    const results: PublicProjectStatus[] = projects.map((project) => ({
      clientName: project.clientName,
      siteLocation: project.siteLocation,
      areaSqFt: project.areaSqFt,
      floors: project.floors,
      startedOn: project.startedOn,
      status: project.status,
      stages: project.stages,
      progressPercent: calculateProgressPercent(project.stages),
    }));

    return NextResponse.json({ projects: results });
  } catch (error) {
    console.error("Failed to look up project by phone:", error);
    return NextResponse.json(
      { error: "Tracker is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
