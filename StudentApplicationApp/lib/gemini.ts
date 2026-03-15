import type { Requirement, RequirementType } from "../App";

type GeminiJobDesc = { jobDescription: string };

const MODEL = "gemini-2.5-flash";
const MODEL2 = "gemini-2.5-flash-lite";

// only downside is that there is a maximum of 20 limit per day hence why I am using 2 models

//  get text from Gemini response
const getCandidateText = (data: any): string => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
    .join("")
    .trim();
};

const extractJobDescriptionFallback = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/"jobDescription"\s*:\s*"([\s\S]*?)"\s*}/);
  if (match?.[1]) {
    const extracted = match[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\");
    return extracted.trim();
  }

  // no crashing
  return trimmed;
};

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
          maxOutputTokens: 10000,
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
  const rawText = getCandidateText(data);

  console.log("Gemini JD rawText:", rawText);
  console.log("Gemini JD finishReason:", data?.candidates?.[0]?.finishReason);

  if (!rawText) {
    throw new Error(
      "Gemini returned an empty job description. Try again, or paste the job description manually.",
    );
  }

  try {
    const parsed = JSON.parse(rawText) as GeminiJobDesc;
    const jd = (parsed?.jobDescription ?? "").trim();
    if (jd) return jd;

    const fallback = extractJobDescriptionFallback(rawText);
    if (fallback) return fallback;

    throw new Error("Job description missing in Gemini JSON response.");
  } catch (e) {
    const fallback = extractJobDescriptionFallback(rawText);
    if (fallback) return fallback;

    throw new Error(
      `Failed to parse job description JSON. Try again or paste manually. (${String(e)})`,
    );
  }
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
- Process = ways of working, policies, workflows (e.g., Agile, code reviews, testing, documentation, security clearance).
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
              { text: `${prompt}\n\nJOB DESCRIPTION:\n${jobDescription}` },
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
      .join("")
      .trim() ?? "";

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

export async function analyseCvBullet(args: {
  bullet: string;
  company: string;
  role: string;
  jobDescription?: string;
}): Promise<string[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_FEEDBACK_API_KEY;

  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_FEEDBACK_API_KEY");

  const bullet = args.bullet.trim();
  if (!bullet) return [];

  const company = (args.company || "").trim();
  const role = (args.role || "").trim();

  console.log("analyseCV bulletPoints:", args.bullet);

  const prompt = `
You are an expert CV coach for ${company}.

TARGET ROLE: ${role}

JOB DESCRIPTION (use this as the source for keywords and expectations):
${args.jobDescription}

USER CV BULLET:
${bullet}

TASK:
Give EXACTLY 4 improvements to the bullet that make it match THIS role better.

OUTPUT FORMAT (VERY IMPORTANT):
- Output EXACTLY 4 lines.
- Each line MUST follow this structure: "Suggestion: <what to add/adjust>. Why: <MUST say why it's relevant to the company and role, and MUST INCLUDE the companies NAME or ROLE as part of the reason> ."
- Each line must reference AT LEAST ONE job related keyword/tool/skill from the job description (or an exact responsibility).
- Do NOT rewrite the full bullet.
- Do NOT mention "job description says" or quote long text.
- Keep suggestion point under 30 words
- Do not include "-" before each suggestion.

Return ONLY the 4 lines and nothing else.
`.trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL2}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${MODEL2} ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim() ?? "";

  const cleaned = rawText.trim();
  if (!cleaned) return [];

  const rawLines = cleaned.split("\n");

  const lines: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed !== "") lines.push(trimmed);
  }
  console.log("Gemini CV Coach Output:", lines);

  return lines.slice(0, 4);
}

export async function analyseCoverLetter(args: {
  coverLetter: string;
  company: string;
  role: string;
  jobDescription?: string;
  bulletPoints?: string[];
}): Promise<string[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_FEEDBACK_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_FEEDBACK_API_KEY");

  const coverLetter = (args.coverLetter || "").trim();
  if (!coverLetter) return [];

  const company = (args.company || "").trim();
  const role = (args.role || "").trim();

  console.log("analyseCoverLetter bulletPoints:", args.bulletPoints);

  const bullets = args.bulletPoints;

  const prompt = `
You are an expert cover letter coach for ${company}.

TARGET ROLE: ${role}

JOB DESCRIPTION (use this as the source for keywords and expectations):
${args.jobDescription}

CANDIDATE EVIDENCE (bullet points the user has created to use as proof/metrics in the cover letter):
${bullets}

USER COVER LETTER DRAFT:
${coverLetter}

TASK:
Give EXACTLY 4 improvements to make this cover letter match THIS role better.

OUTPUT FORMAT (VERY IMPORTANT):
- Output EXACTLY 4 lines.
- Each line MUST follow this structure:
  "Suggestion: <what to add/adjust>. Why: <MUST say why it's relevant to the company and role, and MUST INCLUDE the company NAME or ROLE as part of the reason>."
- Each line must reference AT LEAST ONE job related keyword/tool/skill from the job description (or an exact responsibility).
- Prefer suggestions that include the candidate evidence bullets (metrics, tools, outcomes) into the letter.
- Do NOT rewrite the full cover letter.
- Do NOT mention "job description says" or quote long text.
- Keep each suggestion under 30 words.
- Do not include "-" before each suggestion.

Return ONLY the 4 lines and nothing else.
`.trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL2}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${MODEL2} ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim() ?? "";

  const cleaned = rawText.trim();
  if (!cleaned) return [];

  const rawLines = cleaned.split("\n");
  const lines: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed) lines.push(trimmed);
  }
  console.log("Gemini CL Coach Output:", lines);
  return lines.slice(0, 4);
}

export type StrengthResult = {
  overall: number;
  explanation: string;
  nextAction: string;
  components: {
    roleAlignment: number;
    evidenceQuality: number;
    coverLetterStructure: number;
    companyPersonalisation: number;
  };
  changes: Array<{ points: number; reason: string }>;
  calculatedAt: string;
};

export async function calculateApplicationStrength(args: {
  coverLetter: string;
  company: string;
  role: string;
  jobDescription?: string;
  bulletPoints?: string[];
}): Promise<StrengthResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_STRENGTH_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_STRENGTH_API_KEY");

  const { coverLetter, company, role, jobDescription, bulletPoints } = args;

  console.log("GEMINI STRENGTH CALCULATOR INPUT");
  console.log("Company:", company);
  console.log("Role:", role);
  console.log("Cover Letter Length:", coverLetter?.length ?? 0);
  console.log("Cover Letter Content:", `"${coverLetter}"`);
  console.log("Job Description Length:", jobDescription?.length ?? 0);
  console.log(
    "Job Description Preview:",
    jobDescription?.substring(0, 50) ?? "EMPTY",
  );
  console.log("Bullet Points Count:", bulletPoints?.length ?? 0);
  console.log("Bullet Points:", bulletPoints);
  console.log("GEMINI STRENGTH CALCULATOR OUTPUT");

  const prompt = `
You are an application strength scorer. You MUST be harsh and strict. Low effort = low score. No exceptions.

ROLE: ${role}
COMPANY: ${company}

JOB DESCRIPTION (reference only, do NOT score this):
${jobDescription ?? "Not provided"}

*** CRITICAL INSTRUCTION ***
ONLY evaluate what the STUDENT provided below.
Do NOT mistake the job description for the student's work.
Focus ONLY on:
1. CANDIDATE BULLET POINTS: what the student wrote (may be empty)
2. COVER LETTER: what the student wrote (may be empty)

If the student provided no bullet points AND no cover letter, all component scores should be 0-15 range.

CANDIDATE BULLET POINTS (what the student wrote could be empty):
${bulletPoints?.length === 0 ? "[EMPTY: Student has not provided any bullet points]" : bulletPoints?.join("\n")}

COVER LETTER (what the student wrote could be empty):
${!coverLetter ? "[EMPTY - Student has not written a cover letter]" : coverLetter}

STEP 1 — LENGTH AND EFFORT CHECK (apply before scoring anything):
- If BOTH cover letter and bullet points are [EMPTY], cap ALL components at 0-10 maximum.
- Count the number of lines and paragraphs in the cover letter (if it exists).
- 1–2 sentences: ALL components MUST be 0–10. Stop. Do not score higher.
- 3–4 sentences: ALL components MUST be 0–20. Stop. Do not score higher.
- Only a cover letter with 1 or more full paragraphs is eligible to score above 40 in any component.

STEP 2 — COMPONENT SCORING (only if cover letter passes length check):

ROLE ALIGNMENT FROM COVER LETTER AND BULLET POINTS (weight 30% of overall):
- 0–10:   Student provided NOTHING (no cover letter AND no bullet points)
- 11–20:  Fewer than 3 words or phrases from the job description appear in the cover letter, and weak bullet points with no clear evidence
- 21–40:  1–2 job description keywords present but no responsibilities addressed
- 41–65:  Several keywords used but role requirements are not explicitly tackled
- 66–85:  Most key requirements addressed with relevant, specific language
- 86–100: Many core requirements addressed with precise role-matched evidence

EVIDENCE QUALITY FROM BULLET POINTS (weight 25% of overall):
- 0–10:   Student provided NO BULLET POINTS
- 11–20:  Zero examples, only vague claims ("I am passionate", "I work hard", "I am skilled")
- 21–40:  One vague example with no numbers, outcomes, or specifics
- 41–65:  1–2 examples present but metrics or measurable outcomes are missing
- 66–85:  2+ examples with quantified impact (%, £, count, time saved, etc.)
- 86–100: 3+ examples with strong measurable outcomes drawn from the bullet points

COVER LETTER STRUCTURE (weight 25% of overall):
- 0–10:   Student provided NO COVER LETTER or only "[EMPTY]"
- 11–20:  No structure, a single line or sentence, cannot be called a letter
- 21–40:  A short paragraph exists but has no opening motivation, does not address role requirements or express company research
- 41–65:  Some structure but motivation is generic, explains some fit but not clearly linked to role and surface level knowledge of the company
- 66–85:  Clear opening with motivation, body addresses multiple role requirements with specific evidence, some company research and personalisation
- 86–100: Compelling opening with specific motivation, well structured body that addresses most role requirements with strong evidence, and multiple clear references to the company culture, values, mission, or products throughout the cover letter

COMPANY PERSONALISATION (weight 20% of overall):
- 0–10:   Student provided NO COVER LETTER, so no personalisation possible
- 11–20:  Company not mentioned, or mentioned once with zero context or research
- 21–40:  Company name used but no values, products, mission, or culture referenced at all
- 41–65:  One surface-level reference (e.g. "I admire your mission") with no real depth
- 66–85:  A specific company value, product, or initiative referenced meaningfully
- 86–100: Multiple specific company values or products woven naturally throughout

STEP 3 — OVERALL:
Calculate as (roleAlignment * 0.30) + (evidenceQuality * 0.25) + (coverLetterStructure * 0.25) + (companyPersonalisation * 0.20), rounded to nearest integer.

STEP 4 — CHANGES:
List 2 things that positively contributed to the score.

CRITICAL RULE - If BOTH cover letter and bullet points are [EMPTY]:
- DO NOT award any points
- Set all "points" values to 0
- List 2 things the student should focus on next (what to work on, not praise)
- Do NOT praise them for providing empty fields or "following instructions"
- Example: { "points": 0, "reason": "Add specific, measurable evidence in your bullet points" }
- Example: { "points": 0, "reason": "Write a tailored cover letter addressing the role and company" }

If the cover letter is very weak (but something was provided), keep points values between 1–5 only.

Return ONLY valid JSON, no markdown, no commentary:
{
  "overall": <integer 0–100>,
  "explanation": "<one sentence: tell the candidate directly using 'you'/'your' why this score was given, be honest but encouraging. Highlighting best thing about their application as supporting evidence. If empty, say 'Your application is incomplete, you haven't provided a cover letter or bullet points yet for us to analyse.'>",
  "nextAction": "<one sentence: the single most impactful improvement that the student can make next (for example more personalisation, more evidence in bullet points etc), must sound encouraging>",
  "components": {
    "roleAlignment": <integer 0–100>,
    "evidenceQuality": <integer 0–100>,
    "coverLetterStructure": <integer 0–100>,
    "companyPersonalisation": <integer 0–100>
  },
  "changes": [
    { "points": <int>, "reason": "<what to work on next or what the candidate did well>" },
    { "points": <int>, "reason": "<second actionable item>" }
  ]
}
`.trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL2}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 512 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini strength error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText = getCandidateText(data);
  console.log("Gemini Strength rawText:", rawText);

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as StrengthResult;

  return {
    ...parsed,
    calculatedAt: new Date().toISOString(),
  };
}

export const strengthStorageKey = (applicationId: string) =>
  `strength:${applicationId}`;
