import { NextResponse } from 'next/server';

const GEMINI_API_KEY = "REDACTED_KEY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  try {
    const { text, catalogContext } = await request.json();

    const systemPrompt = `You are an expert music marketing assistant and routing coordinator. Your job is to extract campaign activities from raw, unstructured multi-artist notes and perfectly assign each activity to the correct release.

CRITICAL CONTEXT (The Catalog):
Here is the list of all currently active artists and their latest releases in our database:
${JSON.stringify(catalogContext, null, 2)}

INSTRUCTIONS:
1. Analyze each bullet point or sentence in the raw notes.
2. Identify which artist or release is being talked about.
3. Cross-reference the artist/release with the CATALOG provided above to find the EXACT "releaseId".
4. If a note mentions an artist generally (e.g. "Ayra Starr & The Dotty Show"), you MUST map it to that artist's most recent active release in the catalog.
5. Do NOT invent releaseIds. You must only use the "releaseId"s provided in the catalog.
6. Calculate dates dynamically. If the text says "First week" for a release, calculate ~3 days after that specific release's date. If it says "next week Friday 26th", map it to the 26th of the current month. All dates MUST be in YYYY-MM-DD format.

You must extract the activities into a valid JSON array of objects. 
DO NOT wrap the JSON in markdown blocks (no \`\`\`json). Return ONLY the raw JSON array.
Each object must have the following exact keys and types:
- "releaseId": The matched releaseId from the catalog (string)
- "title": A short, punchy title for the activity (string)
- "description": A slightly longer description of the activity (string)
- "type": Choose one of: "DSP Placement", "Livestream", "Creator Campaign", "Event", "Media Interview", "Radio", "Ad Campaign", "Social Media", "TV", "Music Video", "Photoshoot", "Editorial", "Other"
- "stage": Choose one of: "Pre-Release", "Release Week", "Post-Release" (calculate based on date vs release date)
- "status": Choose one of: "Completed", "In Progress", "Scheduled", "Cancelled" (infer from context)
- "date": The calculated absolute date in YYYY-MM-DD format (string)
- "owner": The person responsible if mentioned, else "Marketing Team" (string)
- "notes": Any additional context or metrics mentioned (string)
- "externalLink": Any URLs mentioned, else "" (string)

Extract the activities from the following raw notes:
${text}
`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Error:", errText);
      return NextResponse.json({ error: "Failed to extract via Gemini" }, { status: 500 });
    }

    const data = await response.json();
    let resultText = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown blocks if the model ignored instructions
    if (resultText.startsWith("\`\`\`json")) {
      resultText = resultText.replace(/\`\`\`json\\n/g, "").replace(/\\n\`\`\`/g, "");
    }
    
    const activities = JSON.parse(resultText);

    return NextResponse.json({ activities });

  } catch (error: any) {
    console.error("Extraction Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
