import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SPOTIFY_TO_SHORT_ID: Record<string, string> = {
  "46pWGuE3dSwY3bMMXGBvVS": "rema",
  "6DUbLg2GQ7Dd7G9v6uwoPT": "boyspyce",
  "7yzmckMWwaSZdJQC5QZ7ws": "lovn",
  "150lmofYTz4i9fnVzM6AZZ": "cupid",
  "4f8vvLN5Rt3WszqOqVR9e9": "johnny",
  "379IT6Szv0zgnw4xrdu4mu": "ladipoe",
  "3ZpEKRjHaHANcpk10u6Ntq": "ayra",
  "6FbCERtE2CKqEWihHMYjcG": "bayanni",
  "0rskhjcLm5BxjwZDRs4142": "magixx"
};

export async function GET() {
  try {
    const dbAlbums = await prisma.album.findMany({
      include: { artists: true },
      orderBy: { releaseDate: 'desc' }
    });
    
    const dbTracks = await prisma.track.findMany({
      include: { artists: true, album: true }
    });

    const seenArtists = new Set<string>();
    
    const releases = dbAlbums
      .filter(a => a.type === 'album' || a.type === 'single')
      .map(a => {
        const shortId = SPOTIFY_TO_SHORT_ID[a.artists[0]?.artistId] || "unknown";
        let status = "completed";
        if (!seenArtists.has(shortId)) {
          status = "active";
          seenArtists.add(shortId);
        }
        
        return {
          id: a.id,
          artistId: shortId,
          title: a.title,
          releaseDate: a.releaseDate,
          artwork: a.artwork || "",
          description: `${a.type === 'album' ? 'Studio Album' : 'Single/EP'}`,
          status
        };
      });

    // Deduplicate tracks by name
    const uniqueTracksMap = new Map();
    for (const t of dbTracks) {
      if (!uniqueTracksMap.has(t.name)) {
        uniqueTracksMap.set(t.name, {
          id: t.id,
          artistId: SPOTIFY_TO_SHORT_ID[t.artists[0]?.artistId] || "unknown",
          name: t.name,
          durationMs: t.durationMs,
          previewUrl: t.previewUrl || "",
          albumImage: t.album?.artwork || ""
        });
      }
    }
    const tracks = Array.from(uniqueTracksMap.values());

    return NextResponse.json({ releases, tracks });
  } catch (error: any) {
    console.error("Catalog Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch catalog from Database", details: error.message }, { status: 500 });
  }
}
