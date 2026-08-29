import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// ─── Types ────────────────────────────────────────────────

export interface WordMeaning {
  partOfSpeech: string   // e.g. "noun", "verb"
  definitionVi: string   // short Vietnamese meaning
}

export interface GeneratedWordData {
  word: string
  phonetic: string
  partOfSpeech: string   // from the first / most common meaning
  definition: string     // from the first / most common meaning (English)
  definitionVi: string   // from the first / most common meaning (Vietnamese)
  synonyms: string[]
  meanings: WordMeaning[] // all common meanings (1–3)
}

// ─── Prompt ───────────────────────────────────────────────

function buildPrompt(word: string): string {
  return `You are an English vocabulary assistant. Analyze the English word: "${word}"

Return ONLY valid JSON matching this exact shape (no markdown, no extra text):
{
  "word": string,         // lowercased
  "phonetic": string,     // IPA e.g. /ɪˈfem.ər.əl/
  "partOfSpeech": string, // part of speech of meanings[0]
  "definition": string,   // English definition of meanings[0], 1 concise sentence
  "definitionVi": string, // mirrors meanings[0].definitionVi
  "synonyms": string[],   // 3–5 synonyms
  "meanings": [           // 1–3 most common meanings
    {
      "partOfSpeech": string, // e.g. "noun", "verb", "adjective"
      "definitionVi": string  // short, natural Vietnamese meaning — no English
    }
  ]
}

Rules:
- meanings: keep only the most common usages, max 3.
- definitionVi in each meaning: concise Vietnamese (≤15 words), no examples.
- root definition/definitionVi must mirror meanings[0].`
}

// ─── Models ───────────────────────────────────────────────
// Primary: gemini-3.6-flash (latest)
// Fallback: gemini-3.5-flash-lite (if primary quota/unavailable)

const PRIMARY_MODEL  = "gemini-3.6-flash"
const FALLBACK_MODEL = "gemini-3.5-flash-lite"

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

  // Helper to run one Gemini attempt with a given model
  async function attempt(model: string): Promise<GeneratedWordData> {
    const response = await ai.models.generateContent({
      model,
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
      // First try: primary model
      data = await attempt(PRIMARY_MODEL)
    } catch (firstErr) {
      // Retry with fallback model (handles quota, 404, deprecation)
      console.warn(
        `[POST /api/generate] ${PRIMARY_MODEL} failed, retrying with ${FALLBACK_MODEL}:`,
        firstErr
      )
      data = await attempt(FALLBACK_MODEL)
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
