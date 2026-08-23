import { create } from "zustand"

// ─── Types ────────────────────────────────────────────────

export interface WordExample {
  sentence: string
  translation: string
  context: string
}

export interface VocabWord {
  id: string
  word: string
  phonetic: string
  definition: string
  partOfSpeech: string
  examples: WordExample[]
  synonyms: string[]
  collection: string
  addedAt: Date
  masteryLevel: number // 0–4
  lastReviewed?: Date
}

export interface VocabCollection {
  id: string
  name: string
  color: string
  wordCount: number
}

interface VocabState {
  words: VocabWord[]
  collections: VocabCollection[]
  addWord: (word: Omit<VocabWord, "id" | "addedAt" | "masteryLevel">) => void
  removeWord: (id: string) => void
  updateWord: (id: string, updates: Partial<VocabWord>) => void
  addCollection: (name: string, color: string) => void
}

// ─── Mock seed data ───────────────────────────────────────

const MOCK_WORDS: VocabWord[] = [
  {
    id: "1",
    word: "ephemeral",
    phonetic: "/ɪˈfem.ər.əl/",
    definition: "Lasting for a very short time",
    partOfSpeech: "adjective",
    examples: [
      { sentence: "The beauty of cherry blossoms is ephemeral.", translation: "Vẻ đẹp của hoa anh đào rất ngắn ngủi.", context: "nature" },
      { sentence: "Social media trends are often ephemeral.", translation: "Xu hướng mạng xã hội thường rất thoáng qua.", context: "technology" },
    ],
    synonyms: ["fleeting", "transient", "momentary"],
    collection: "default",
    addedAt: new Date("2026-08-20"),
    masteryLevel: 2,
  },
  {
    id: "2",
    word: "serendipity",
    phonetic: "/ˌser.ənˈdɪp.ɪ.ti/",
    definition: "The occurrence of events by chance in a happy or beneficial way",
    partOfSpeech: "noun",
    examples: [
      { sentence: "Finding my dream job was pure serendipity.", translation: "Tìm được công việc mơ ước là điều tình cờ thuần túy.", context: "career" },
      { sentence: "Their meeting was a moment of serendipity.", translation: "Cuộc gặp gỡ của họ là khoảnh khắc tình cờ may mắn.", context: "relationship" },
    ],
    synonyms: ["luck", "fortune", "chance"],
    collection: "default",
    addedAt: new Date("2026-08-21"),
    masteryLevel: 1,
  },
  {
    id: "3",
    word: "resilience",
    phonetic: "/rɪˈzɪl.i.əns/",
    definition: "The capacity to recover quickly from difficulties",
    partOfSpeech: "noun",
    examples: [
      { sentence: "Her resilience in the face of adversity inspired everyone.", translation: "Sự kiên cường của cô ấy trước nghịch cảnh đã truyền cảm hứng cho mọi người.", context: "personal" },
    ],
    synonyms: ["toughness", "grit", "perseverance"],
    collection: "academic",
    addedAt: new Date("2026-08-22"),
    masteryLevel: 3,
  },
  {
    id: "4",
    word: "ambiguous",
    phonetic: "/æmˈbɪɡ.ju.əs/",
    definition: "Open to more than one interpretation; not having one obvious meaning",
    partOfSpeech: "adjective",
    examples: [
      { sentence: "The instructions were ambiguous and confusing.", translation: "Hướng dẫn không rõ ràng và gây nhầm lẫn.", context: "work" },
    ],
    synonyms: ["unclear", "vague", "equivocal"],
    collection: "academic",
    addedAt: new Date("2026-08-22"),
    masteryLevel: 1,
  },
  {
    id: "5",
    word: "eloquent",
    phonetic: "/ˈel.ə.kwənt/",
    definition: "Fluent or persuasive in speaking or writing",
    partOfSpeech: "adjective",
    examples: [
      { sentence: "She gave an eloquent speech that moved the audience.", translation: "Cô ấy đã có bài phát biểu hùng hồn khiến khán giả xúc động.", context: "communication" },
    ],
    synonyms: ["articulate", "expressive", "persuasive"],
    collection: "default",
    addedAt: new Date("2026-08-23"),
    masteryLevel: 0,
  },
  {
    id: "6",
    word: "meticulous",
    phonetic: "/məˈtɪk.jʊ.ləs/",
    definition: "Showing great attention to detail or correct behavior",
    partOfSpeech: "adjective",
    examples: [
      { sentence: "He was meticulous in his research, leaving no stone unturned.", translation: "Anh ấy rất tỉ mỉ trong nghiên cứu, không bỏ sót bất cứ điều gì.", context: "work" },
    ],
    synonyms: ["thorough", "careful", "precise"],
    collection: "default",
    addedAt: new Date("2026-08-23"),
    masteryLevel: 2,
  },
]

const MOCK_COLLECTIONS: VocabCollection[] = [
  { id: "default", name: "General", color: "indigo", wordCount: 4 },
  { id: "academic", name: "Academic", color: "violet", wordCount: 2 },
  { id: "business", name: "Business", color: "emerald", wordCount: 0 },
]

// ─── Store ────────────────────────────────────────────────

export const useVocabStore = create<VocabState>((set) => ({
  words: MOCK_WORDS,
  collections: MOCK_COLLECTIONS,

  addWord: (word) =>
    set((state) => ({
      words: [
        {
          ...word,
          id: crypto.randomUUID(),
          addedAt: new Date(),
          masteryLevel: 0,
        },
        ...state.words,
      ],
    })),

  removeWord: (id) =>
    set((state) => ({
      words: state.words.filter((w) => w.id !== id),
    })),

  updateWord: (id, updates) =>
    set((state) => ({
      words: state.words.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  addCollection: (name, color) =>
    set((state) => ({
      collections: [
        ...state.collections,
        { id: crypto.randomUUID(), name, color, wordCount: 0 },
      ],
    })),
}))
