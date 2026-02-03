type GeminiJobDesc = { jobDescription: string };
import type { Requirement, RequirementType } from "../App";

const MODEL = "gemini-2.5-flash";
// used from the gemini documentation to retrieve job descriptions from url, later i need to be able to extract requirements from descritpion
// only downside is that there is a maximum of 20 limit per day

export async function extractJobDescriptionFromUrl(jobUrl: string) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");

  const prompt = `
You are extracting a job description from a job posting URL.

URL: ${jobUrl}

Return ONLY the full job description text (responsibilities, requirements, qualifications, etc.).
Do not include navigation, cookie banners, or unrelated page content.

Respond as JSON with this shape:
{ "jobDescription": "..." }
`.trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],

        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ??
    "";
  console.log("🟣 Gemini JD rawText:", rawText);

  const parsed = JSON.parse(rawText) as GeminiJobDesc;
  return (parsed.jobDescription ?? "").trim();
}

type GeminiRequirements = {
  requirements: Array<{
    title: string;
    type: string;
    category: string;
  }>;
};

const toRequirementType = (value: any): RequirementType => {
  return value === "must-have" || value === "nice-to-have"
    ? value
    : "must-have";
};

const toCategory = (value: any): string => {
  const allowed = ["Technical", "Soft Skills", "Process", "Domain"];
  return allowed.includes(value) ? value : "Technical";
};

export async function extractRequirementsFromJobDescription(
  jobDescription: string,
): Promise<Requirement[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");

  const prompt = `
You are given a job description.

TASK:
Extract EXACTLY 8 key requirements from the job description.

RULES:
- Each requirement must have:
  - title (short)
  - type: "must-have" or "nice-to-have"
  - category: "Technical" | "Soft Skills" | "Process" | "Domain"
  - Ensure you include at least:
  - 3 Technical
  - 2 Soft Skills or Process combined
  - 1 Domain IF the job description implies a domain (otherwise use Technical/Soft Skills)  
- Return ONLY valid JSON (no markdown, no commentary)

CATEGORY DEFINITIONS: 
- Technical = programming languages, frameworks, systems, tools, CS fundamentals (e.g, React, Java, SQL, AWS, data structures).
- Soft Skills = interpersonal or cognitive skills (e.g., communication, leadership, problem solving).
- Process = ways of workinG, policies, workflows (e.g., Agile, code reviews, testing, documentation, security clearance).
- Domain = industry/product knowledge (e.g., fintech payments, investment banking).

`.trim();

  const schema = {
    type: "object",
    properties: {
      requirements: {
        type: "array",
        minItems: 8,
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            type: { type: "string", enum: ["must-have", "nice-to-have"] },
            category: {
              type: "string",
              enum: ["Technical", "Soft Skills", "Process", "Domain"],
            },
          },
          required: ["title", "type", "category"],
        },
      },
    },
    required: ["requirements"],
    additionalProperties: false,
  } as const;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${prompt}\n\nJOB DESCRIPTION:\n${jobDescription}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];

  const rawText =
    candidate?.content?.parts
      ?.map((p: any) => (typeof p.text === "string" ? p.text : ""))
      .join("") ?? "";

  console.log("🟣 Gemini requirements rawText:", rawText);
  console.log("Finished Reason:", candidate?.finishReason);

  let parsed: GeminiRequirements;
  try {
    parsed = JSON.parse(rawText) as GeminiRequirements;
  } catch (e) {
    if (candidate?.finishReason === "MAX_TOKENS") {
      const shorter = jobDescription.slice(0, 8000);
      return extractRequirementsFromJobDescription(shorter);
    }
    throw new Error(`Failed to parse requirements JSON: ${String(e)}`);
  }

  const list = Array.isArray(parsed.requirements) ? parsed.requirements : [];
  return list.slice(0, 8).map((r, idx) => ({
    id: String(idx + 1),
    title: String(r.title ?? "").trim() || "Requirement",
    type: toRequirementType(r.type),
    category: toCategory(r.category),
  }));
}
