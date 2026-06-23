import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, Type } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required for AI extraction" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        artist: {
          type: Type.STRING,
          description: "The name of the artist for this campaign",
        },
        releaseName: {
          type: Type.STRING,
          description: "The name of the release or album for this campaign",
        },
        extractedActivities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The title or description of the activity (e.g., 'DSP Editorial Placements')",
              },
              type: {
                type: Type.STRING,
                description: "The type of activity, e.g., 'Digital', 'PR', 'Radio', 'Event', 'Other'",
              },
              stage: {
                type: Type.STRING,
                description: "The stage of the campaign, e.g., 'Pre-Release', 'Release Week', 'Post-Release'",
              },
              date: {
                type: Type.STRING,
                description: "The date of the activity if mentioned (ISO format YYYY-MM-DD), otherwise provide a reasonable default like today's date.",
              },
              status: {
                type: Type.STRING,
                description: "The status of the activity, e.g., 'Scheduled', 'In Progress', 'Completed', defaulting to 'Scheduled'.",
              }
            },
            required: ["title", "type", "stage", "date", "status"],
          },
        },
      },
      required: ["artist", "releaseName", "extractedActivities"],
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const prompt = `
    You are an expert music marketing assistant. Please extract the campaign plan details from the following text. 
    The text usually contains an artist name, a release name (like an album or single), and a list of campaign activities.
    
    Text to analyze:
    """
    ${text}
    """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text());

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Extraction Error:", error);
    return NextResponse.json({ error: "Failed to parse request or communicate with AI", details: error.message }, { status: 500 });
  }
}
