import { NextResponse } from 'next/server';
import { getArtistAlbums, getArtistTopTracks } from '../../../../lib/spotify';

const ARTIST_MAPPING: Record<string, string> = {
  "rema": "46pWGuE3dSwY3bMMXGBvVS",
  "boyspyce": "6DUbLg2GQ7Dd7G9v6uwoPT",
  "lovn": "7yzmckMWwaSZdJQC5QZ7ws",
  "cupid": "150lmofYTz4i9fnVzM6AZZ",
  "johnny": "4f8vvLN5Rt3WszqOqVR9e9",
  "ladipoe": "379IT6Szv0zgnw4xrdu4mu",
  "ayra": "3ZpEKRjHaHANcpk10u6Ntq",
  "bayanni": "6FbCERtE2CKqEWihHMYjcG",
  "magixx": "0rskhjcLm5BxjwZDRs4142"
};

export async function GET() {
  try {
    const releases = [];
    const tracks = [];

    // To prevent hitting rate limits instantly and taking too long, we fetch concurrently but carefully
    for (const [internalId, spotifyId] of Object.entries(ARTIST_MAPPING)) {
      const [albumsData, tracksData] = await Promise.all([
        getArtistAlbums(spotifyId),
        getArtistTopTracks(spotifyId)
      ]);

      // Process Albums -> Releases
      if (albumsData && albumsData.length > 0) {
        albumsData.forEach((album: any) => {
          // Avoid duplicates if multiple markets return the same album, simple dedup by name or ID
          if (!releases.find(r => r.title === album.name && r.artistId === internalId)) {
            releases.push({
              id: album.id,
              artistId: internalId,
              title: album.name,
              releaseDate: album.release_date,
              artwork: album.images[0]?.url || "",
              description: `${album.album_type === 'album' ? 'Studio Album' : 'Single/EP'} by ${album.artists[0].name}`,
              status: "active" // Defaulting to active for UI display
            });
          }
        });
      }

      // Process Top Tracks
      if (tracksData && tracksData.length > 0) {
        tracksData.forEach((track: any) => {
          tracks.push({
            id: track.id,
            artistId: internalId,
            name: track.name,
            durationMs: track.duration_ms,
            previewUrl: track.preview_url,
            albumImage: track.album.images[0]?.url || ""
          });
        });
      }
    }

    return NextResponse.json({ releases, tracks });
  } catch (error: any) {
    console.error("Spotify Sync Error:", error);
    return NextResponse.json({ error: "Failed to fetch from Spotify" }, { status: 500 });
  }
}
