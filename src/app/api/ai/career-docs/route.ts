import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      jobTitle,
      companyName,
      jobDescription,
      currentCv,
      currentExperience,
      tone,
    } = body ?? {};

    if (!jobTitle || !companyName || !jobDescription) {
      return NextResponse.json(
        { error: "jobTitle, companyName, and jobDescription are required." },
        { status: 400 }
      );
    }

    const prompt = `
You are a career assistant helping an international student in the UK apply for jobs.

Generate 2 sections:

1. TAILORED_CV
- Rewrite the candidate's CV bullets to better match the job.
- Keep it realistic.
- Use concise, strong bullet points.
- Include a short professional summary at the top.
- Mention visa-awareness carefully and professionally where helpful.

2. COVER_LETTER
- Write a short tailored cover letter.
- Keep it practical and believable.
- Tone: ${tone || "professional"}
- Focus on fit for the role, motivation, and transferable skills.
- Do not invent experience.
- Mention visa status carefully only if useful.

Candidate current CV:
${currentCv || "Not provided"}

Candidate experience notes:
${currentExperience || "Not provided"}

Job title:
${jobTitle}

Company:
${companyName}

Job description:
${jobDescription}

Output format exactly:

TAILORED_CV
<content>

COVER_LETTER
<content>
`;

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    return NextResponse.json({
      result: response.output_text,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Something went wrong." },
      { status: 500 }
    );
  }
}