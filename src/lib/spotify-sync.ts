import { PrismaClient } from '@prisma/client';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const getAccessToken = async () => {
  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  };

  const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
  const data = await response.json();
  return data.access_token;
};

const prisma = new PrismaClient();

const ARTISTS = [
  { id: "46pWGuE3dSwY3bMMXGBvVS", name: "Rema" },
  { id: "6DUbLg2GQ7Dd7G9v6uwoPT", name: "Boy Spyce" },
  { id: "7yzmckMWwaSZdJQC5QZ7ws", name: "Lovn" },
  { id: "150lmofYTz4i9fnVzM6AZZ", name: "CupidSZN" },
  { id: "4f8vvLN5Rt3WszqOqVR9e9", name: "Johnny Drille" },
  { id: "379IT6Szv0zgnw4xrdu4mu", name: "LADIPOE" },
  { id: "3ZpEKRjHaHANcpk10u6Ntq", name: "Ayra Starr" },
  { id: "6FbCERtE2CKqEWihHMYjcG", name: "Bayanni" },
  { id: "0rskhjcLm5BxjwZDRs4142", name: "Magixx" }
];

async function fetchPaginated(url: string, token: string) {
  let items: any[] = [];
  let nextUrl = url;
  while (nextUrl) {
    const res = await fetch(nextUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.error(`Failed to fetch ${nextUrl}`, res.status);
      break;
    }
    const data = await res.json();
    if (data.items) {
      items.push(...data.items);
    }
    nextUrl = data.next;
  }
  return items;
}

export async function runDeepSync() {
  const token = await getAccessToken();
  const internalIds = ARTISTS.map(a => a.id);
  
  console.log("Starting deep sync for artists...");
  
  for (const artist of ARTISTS) {
    await prisma.artist.upsert({
      where: { id: artist.id },
      update: { name: artist.name },
      create: { id: artist.id, name: artist.name }
    });
  }

  for (const artist of ARTISTS) {
    console.log(`Fetching for ${artist.name}...`);
    const groups = ['album', 'single', 'appears_on', 'compilation'];
    
    for (const group of groups) {
      const albums = await fetchPaginated(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=${group}&limit=50&market=US`, token);
      console.log(`Found ${albums.length} ${group}s for ${artist.name}`);
      
      for (const album of albums) {
        await prisma.album.upsert({
          where: { id: album.id },
          update: { type: group }, // Might want to update fields if changed
          create: {
            id: album.id,
            title: album.name,
            releaseDate: album.release_date,
            artwork: album.images?.[0]?.url,
            type: group,
          }
        });
        
        await prisma.albumArtist.upsert({
          where: { albumId_artistId: { albumId: album.id, artistId: artist.id } },
          update: {},
          create: { albumId: album.id, artistId: artist.id }
        });

        const tracks = await fetchPaginated(`https://api.spotify.com/v1/albums/${album.id}/tracks?limit=50&market=US`, token);
        
        for (const track of tracks) {
          const trackArtistIds = track.artists.map((a: any) => a.id);
          const hasManagedArtist = trackArtistIds.some((id: string) => internalIds.includes(id));
          
          if (hasManagedArtist) {
            await prisma.track.upsert({
              where: { id: track.id },
              update: { previewUrl: track.preview_url },
              create: {
                id: track.id,
                name: track.name,
                durationMs: track.duration_ms,
                previewUrl: track.preview_url,
                albumId: album.id,
              }
            });

            for (const tArtistId of trackArtistIds) {
              if (internalIds.includes(tArtistId)) {
                await prisma.trackArtist.upsert({
                  where: { trackId_artistId: { trackId: track.id, artistId: tArtistId } },
                  update: {},
                  create: { trackId: track.id, artistId: tArtistId }
                });
              }
            }
          }
        }
      }
    }
  }
  
  console.log("Deep sync complete!");
}
