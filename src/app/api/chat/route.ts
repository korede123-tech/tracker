import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  try {
    const { messages, catalogContext } = await request.json();

    const systemPrompt = `You are an expert music marketing assistant. Your job is to converse with the user, answer questions, draft emails, and extract campaign activities from raw notes. Keep your responses extremely concise and to the point. Do not introduce yourself with long paragraphs.

CRITICAL CONTEXT (The Catalog):
Here is the list of all currently active artists and their latest releases in our database:
${JSON.stringify(catalogContext, null, 2)}

INSTRUCTIONS FOR EXTRACTING ACTIVITIES:
If the user provides raw notes or explicitly asks to extract activities:
1. Analyze the notes and identify the artist or release being discussed.
2. Cross-reference with the CATALOG above to find the EXACT "releaseId". (For general artist mentions, map to their most recent release in the catalog). Do NOT invent releaseIds.
3. Calculate absolute dates dynamically (e.g. "First week" = ~3 days after release date. "Friday 26th" = the 26th of the current month). Format: YYYY-MM-DD.
4. If you extract activities, you MUST include a JSON array wrapped in \`\`\`json ... \`\`\` blocks in your response.
5. Each object in the JSON array must strictly match:
   - "releaseId": string (MUST match catalog exactly)
   - "title": string
   - "description": string
   - "type": "DSP Placement" | "Livestream" | "Creator Campaign" | "Event" | "Media Interview" | "Radio" | "Ad Campaign" | "Social Media" | "TV" | "Music Video" | "Photoshoot" | "Editorial" | "Other"
   - "stage": "Pre-Release" | "Release Week" | "Post-Release"
   - "status": "Completed" | "In Progress" | "Scheduled" | "Cancelled"
   - "date": string (YYYY-MM-DD)
   - "owner": string
   - "notes": string
   - "externalLink": string

You can reply naturally to the user, but keep it brief. If extracting activities, make sure the \`\`\`json block is present!`;

    // Map messages into Gemini's expected format { role: "user" | "model", parts: [{ text: "..." }] }
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "I can help." }] },
    ];
    
    // Add history
    for (const msg of messages) {
      geminiMessages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.3,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Error:", errText);
      return NextResponse.json({ error: "Failed to communicate with Gemini" }, { status: 500 });
    }

    const data = await response.json();
    let resultText = data.candidates[0].content.parts[0].text;
    
    // Parse any JSON block in the text
    let activities = [];
    const jsonMatch = resultText.match(/```json([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        activities = JSON.parse(jsonMatch[1].trim());
        // We can cleanly remove the json block from the reply text so it doesn't show in the chat UI
        resultText = resultText.replace(/```json[\s\S]*?```/, "").trim();
      } catch(e) {
        console.error("Failed to parse extracted JSON:", e);
      }
    }

    return NextResponse.json({ reply: resultText, extractedActivities: activities });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
