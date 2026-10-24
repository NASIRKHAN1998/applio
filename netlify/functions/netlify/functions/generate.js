exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  if (!process.env.GEMINI_API_KEY) return json(500, { error: "GEMINI_API_KEY is not set on Netlify" });
  try {
    const { cv, job, name } = JSON.parse(event.body || "{}");
    if (!cv || !job) return json(400, { error: "Missing cv or job" });
    const prompt = `You help a job seeker apply. Compare the CV to the job.
Return ONLY JSON: {"score": <number 0-100 match>, "letter": "<tailored cover letter, 150-200 words, honest, uses only facts from the CV, signed ${name || "the candidate"}>", "tips": ["<3 short CV edits to make for this job>"]}

JOB: ${job.title} at ${job.company}
${(job.description || "").slice(0, 3500)}

CV:
${cv.slice(0, 8000)}`;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 1200 }
      })
    });
    const d = await r.json();
    if (!r.ok) return json(502, { error: d.error?.message || "AI error" });
    const text = (d.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").replace(/```json|```/g, "").trim();
    return json(200, JSON.parse(text));
  } catch (e) {
    return json(500, { error: "Could not generate" });
  }
};
