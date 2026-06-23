import { NextResponse } from 'next/server';
import { runDeepSync } from '../../../../lib/spotify-sync';

export async function POST() {
  try {
    await runDeepSync();
    return NextResponse.json({ success: true, message: "Deep sync completed successfully!" });
  } catch (error: any) {
    console.error("Deep Sync Error:", error);
    return NextResponse.json({ error: "Failed to run deep sync", details: error.message }, { status: 500 });
  }
}
