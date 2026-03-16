import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const body = await req.json();

    const {
      jobTitle,
      companyName,
      jobDescription,
      currentCv,
      currentExperience,
      tone,
      profileCvUrl,
    } = body ?? {};

    if (!jobTitle || !companyName || !jobDescription) {
      return NextResponse.json(
        { error: "jobTitle, companyName, and jobDescription are required." },
        { status: 400 }
      );
    }

    const hasPastedCv = Boolean(currentCv && String(currentCv).trim());
    const hasProfileCvUrl = Boolean(profileCvUrl && String(profileCvUrl).trim());

    const cvContext = hasPastedCv
      ? `
Primary CV source:
The candidate pasted their current CV below. Use this as the main source of truth for their background, achievements, and experience. Improve wording, structure, and alignment to the role, but do not invent qualifications or results.

Pasted CV:
${currentCv}
`
      : hasProfileCvUrl
      ? `
Primary CV source:
The candidate has an uploaded CV on their profile.

Uploaded CV URL:
${profileCvUrl}

Important instruction:
You may use this uploaded CV reference as supporting candidate context, but do not assume hidden details that are not explicitly provided elsewhere in this prompt. If information is missing, stay realistic, keep the output conservative, and do not invent experience, certifications, technologies, or metrics.
`
      : `
Primary CV source:
No CV text was pasted and no uploaded profile CV URL was provided.

Important instruction:
Create a realistic tailored draft using only the job description and the candidate notes below. Do not invent specific achievements, employers, tools, certifications, grades, or years of experience.
`;

    const experienceContext = currentExperience?.trim()
      ? `
Candidate experience notes:
${currentExperience}
`
      : `
Candidate experience notes:
Not provided.
`;

    const prompt = `
You are a career assistant helping an international student or professional in the UK apply for a job.

Your task is to generate 2 sections:

1. TAILORED_CV
- Rewrite the candidate's CV so it better matches the job.
- Keep it realistic and truthful.
- Use concise, strong bullet points.
- Include a short professional summary at the top.
- Improve clarity, structure, and alignment to the role.
- Mention visa-awareness carefully and professionally only where helpful.
- If the candidate background is incomplete, write conservatively and avoid invented claims.

2. COVER_LETTER
- Write a short tailored cover letter.
- Keep it practical, believable, and job-specific.
- Tone: ${tone || "professional"}
- Focus on fit for the role, motivation, and transferable skills.
- Do not invent experience.
- Mention visa status carefully only if useful and supported by the provided context.

Grounding rules:
- Never fabricate employers, dates, grades, achievements, results, or technical tools.
- Do not claim the candidate has direct experience unless it is clearly supported by the provided input.
- If some details are missing, use broader but still credible phrasing.
- Optimize for realism and application quality, not exaggeration.

${cvContext}

${experienceContext}

Target job title:
${jobTitle}

Target company:
${companyName}

Target job description:
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