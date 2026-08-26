import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// ─── Types ────────────────────────────────────────────────

export interface GeneratedWordData {
  word: string
  phonetic: string
  partOfSpeech: string
  definition: string
  definitionVi: string
  examples: { sentence: string; translation: string; context: string }[]
  synonyms: string[]
}

// ─── Prompt ───────────────────────────────────────────────

function buildPrompt(word: string): string {
  return `You are an English vocabulary expert. Analyze the English word: "${word}"

Return ONLY valid JSON (no markdown fences, no extra text) that exactly matches this TypeScript type:
{
  "word": string,          // the word as given, lowercased
  "phonetic": string,      // IPA transcription e.g. /ɪˈfem.ər.əl/
  "partOfSpeech": string,  // e.g. "adjective", "noun", "verb"
  "definition": string,    // clear, concise English definition (1–2 sentences)
  "definitionVi": string,  // Vietnamese translation of the definition
  "examples": [            // exactly 2 example sentences
    {
      "sentence": string,    // natural English sentence using the word
      "translation": string, // Vietnamese translation of the sentence
      "context": string      // one word context label e.g. "work", "nature"
    }
  ],
  "synonyms": string[]     // 3 to 5 synonyms
}`
}

// ─── POST /api/generate ───────────────────────────────────
// Accepts: { word: string }
// Returns: GeneratedWordData JSON

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured. Add it to your .env file." },
      { status: 500 }
    )
  }

  let word: string
  try {
    const body = await request.json()
    word = (body.word ?? "").trim()
    if (!word) throw new Error("empty")
  } catch {
    return NextResponse.json({ error: "word is required" }, { status: 400 })
  }

  const ai = new GoogleGenAI({ apiKey })

  // Helper to run one Gemini attempt
  async function attempt(): Promise<GeneratedWordData> {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: buildPrompt(word),
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    })

    const raw = response.text ?? ""

    // Strip accidental markdown fences if the model ignores responseMimeType
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim()

    const parsed = JSON.parse(cleaned) as GeneratedWordData

    // Basic validation
    if (!parsed.word || !parsed.definition) {
      throw new Error("Invalid response structure from Gemini")
    }

    return parsed
  }

  try {
    let data: GeneratedWordData
    try {
      data = await attempt()
    } catch (firstErr) {
      // Retry once on parse/network failure
      console.warn("[POST /api/generate] first attempt failed, retrying:", firstErr)
      data = await attempt()
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[POST /api/generate]", err)
    return NextResponse.json(
      { error: "Failed to generate word data. Please try again." },
      { status: 500 }
    )
  }
}
