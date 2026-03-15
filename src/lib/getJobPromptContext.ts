import { supabase } from "@/lib/supabase/client";

type JobPromptContext = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  visa_sponsorship: string | null;
  company_name: string | null;
  company_website: string | null;
  company_description: string | null;
};

export async function getJobPromptContext(jobId: string): Promise<{
  data: JobPromptContext | null;
  error: string | null;
}> {
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      "id, title, location, work_mode, visa_sponsorship, company_id, sponsor_id"
    )
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) {
    return { data: null, error: jobError.message };
  }

  if (!job) {
    return { data: null, error: "Job not found." };
  }

  let company_name: string | null = null;
  let company_website: string | null = null;
  let company_description: string | null = null;

  if (job.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("name, website, description")
      .eq("id", job.company_id)
      .maybeSingle();

    if (company) {
      company_name = company.name ?? null;
      company_website = company.website ?? null;
      company_description = company.description ?? null;
    }
  }

  if (!company_name && job.sponsor_id) {
    const { data: sponsor } = await supabase
      .from("sponsors")
      .select("name, website, intelligence_notes")
      .eq("id", job.sponsor_id)
      .maybeSingle();

    if (sponsor) {
      company_name = sponsor.name ?? null;
      company_website = sponsor.website ?? null;
      company_description = sponsor.intelligence_notes ?? null;
    }
  }

  return {
    data: {
      id: job.id,
      title: job.title,
      location: job.location ?? null,
      work_mode: job.work_mode ?? null,
      visa_sponsorship: job.visa_sponsorship ?? null,
      company_name,
      company_website,
      company_description,
    },
    error: null,
  };
}
