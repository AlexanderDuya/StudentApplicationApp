type GeminiJobDesc = { jobDescription: string };

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

  const parsed = JSON.parse(rawText) as GeminiJobDesc;

  return (parsed.jobDescription ?? "").trim();
}
