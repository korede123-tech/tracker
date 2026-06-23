import { runDeepSync } from './src/lib/spotify-sync';

async function main() {
  console.log("Starting full deep sync...");
  try {
    await runDeepSync();
    console.log("Deep sync completed successfully!");
  } catch (err) {
    console.error("Deep sync failed:", err);
  }
  process.exit(0);
}

main();
