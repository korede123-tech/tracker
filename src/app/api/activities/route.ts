import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(activities);
  } catch (error: any) {
    console.error("Activities Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Support saving an array of activities
    if (Array.isArray(data)) {
      await prisma.activity.createMany({
        data: data.map(act => ({
          releaseId: act.releaseId,
          title: act.title,
          description: act.description,
          type: act.type,
          stage: act.stage,
          status: act.status,
          date: act.date,
          owner: act.owner || "System",
          notes: act.notes || "",
          externalLink: act.externalLink || ""
        }))
      });
      return NextResponse.json({ success: true });
    }
    
    // Fallback for single activity
    const act = await prisma.activity.create({
      data: {
        releaseId: data.releaseId,
        title: data.title,
        description: data.description,
        type: data.type,
        stage: data.stage,
        status: data.status,
        date: data.date,
        owner: data.owner || "System",
        notes: data.notes || "",
        externalLink: data.externalLink || ""
      }
    });
    
    return NextResponse.json(act);
  } catch (error: any) {
    console.error("Activity Save Error:", error);
    return NextResponse.json({ error: "Failed to save activities" }, { status: 500 });
  }
}
